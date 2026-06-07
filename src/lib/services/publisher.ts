import { prisma } from "@/lib/prisma";

/**
 * Execute the auto-post publishing pipeline.
 * This function finds all posts that are SCHEDULED and whose scheduledTime is <= NOW.
 */
export async function executeAutoPost() {
  console.log(`[Publisher] Starting execution sweep at ${new Date().toISOString()}`);

  try {
    const now = new Date();
    
    // Find posts ready to publish
    const postsToPublish = await prisma.post.findMany({
      where: {
        status: "SCHEDULED",
        scheduledTime: {
          lte: now,
        },
      },
      include: {
        media: {
          include: {
            mediaAsset: true,
          },
        },
        targets: {
          include: {
            socialConnection: true,
          },
        },
      },
    });

    if (postsToPublish.length === 0) {
      console.log("[Publisher] No scheduled posts found to process.");
      return { success: true, count: 0 };
    }

    console.log(`[Publisher] Found ${postsToPublish.length} post(s) to publish.`);

    let processedCount = 0;

    for (const post of postsToPublish) {
      console.log(`[Publisher] Processing Post ID: ${post.id}`);
      
      // Update status to PUBLISHING to prevent concurrent sweeps from grabbing it
      await prisma.post.update({
        where: { id: post.id },
        data: { status: "PUBLISHING" },
      });

      let allTargetsSuccessful = true;
      let anyTargetFailed = false;

      // Extract image URL if exists (Currently handling 1 image for Facebook)
      const firstImage = post.media.find(m => m.mediaAsset.fileType === "IMAGE");
      const imageUrl = firstImage ? firstImage.mediaAsset.fileUrl : null;

      for (const target of post.targets) {
        console.log(`[Publisher] -> Target: ${target.socialConnection.platform} (${target.socialConnection.accountName})`);
        
        try {
          if (target.socialConnection.platform === "FACEBOOK") {
            const pageId = target.socialConnection.accountId;
            const accessToken = target.socialConnection.accessToken;
            const message = post.content;
            
            // Validate imageUrl - must be a public http/https URL accessible by Facebook
            // Local blob: URLs, localhost, or non-http URLs are not valid for Facebook API
            const isValidPublicUrl = imageUrl && 
              (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) &&
              !imageUrl.includes("localhost") &&
              !imageUrl.includes("127.0.0.1") &&
              !imageUrl.startsWith("blob:") &&
              imageUrl.length > 10;

            // Facebook Graph API Endpoint
            // Use /photos if we have a valid public image URL, otherwise /feed for text post
            const endpoint = isValidPublicUrl
              ? `https://graph.facebook.com/v19.0/${pageId}/photos`
              : `https://graph.facebook.com/v19.0/${pageId}/feed`;

            const payload: any = {
              message: message,
              access_token: accessToken,
            };

            if (isValidPublicUrl) {
              payload.url = imageUrl;
            }

            console.log(`[Publisher] Posting to Facebook (${isValidPublicUrl ? "with image" : "text only"})...`);
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.error?.message || "Unknown Facebook API Error");
            }

            console.log(`[Publisher] Success! FB Post ID: ${data.id || data.post_id}`);

            // Update PostTarget as SUCCESS
            await prisma.postTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                externalPostId: data.id || data.post_id,
              },
            });

          } else {
             // Handle other platforms (INSTAGRAM, TWITTER, LINKEDIN) later
             throw new Error(`Platform ${target.socialConnection.platform} not yet implemented.`);
          }

        } catch (error: any) {
          console.error(`[Publisher] Target Error: ${error.message}`);
          allTargetsSuccessful = false;
          anyTargetFailed = true;

          // Update PostTarget as FAILED
          await prisma.postTarget.update({
            where: { id: target.id },
            data: {
              status: "FAILED",
              errorMessage: error.message,
            },
          });
        }
      }

      // Conclude overall post status
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: allTargetsSuccessful ? "PUBLISHED" : (anyTargetFailed ? "FAILED" : "PUBLISHED"),
          publishedTime: new Date(),
        },
      });

      processedCount++;
    }

    return { success: true, count: processedCount };

  } catch (error: any) {
    console.error("[Publisher] Fatal Error in execution:", error);
    return { success: false, error: error.message };
  }
}
