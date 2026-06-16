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
        isDeleted: false,
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

            // Collect all valid public video URLs
            const validVideos = post.media
              .filter(m => m.mediaAsset.fileType === "VIDEO")
              .map(m => m.mediaAsset.fileUrl)
              .filter(url =>
                url &&
                (url.startsWith("http://") || url.startsWith("https://")) &&
                !url.includes("localhost") &&
                !url.includes("127.0.0.1") &&
                !url.startsWith("blob:") &&
                url.length > 10
              );

            // Collect all valid public image URLs
            const validImages = post.media
              .filter(m => m.mediaAsset.fileType === "IMAGE")
              .map(m => m.mediaAsset.fileUrl)
              .filter(url =>
                url &&
                (url.startsWith("http://") || url.startsWith("https://")) &&
                !url.includes("localhost") &&
                !url.includes("127.0.0.1") &&
                !url.startsWith("blob:") &&
                url.length > 10
              );

            let externalPostId: string;

            if (validVideos.length > 0) {
              // ── Video post ──
              console.log("[Publisher] Posting video to Facebook...");
              const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/videos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  description: message,
                  file_url: validVideos[0],
                  access_token: accessToken,
                }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error?.message || "Facebook Video API Error");
              externalPostId = data.id;

            } else if (validImages.length === 0) {
              // ── Text-only post ──
              console.log("[Publisher] Posting text-only to Facebook...");
              const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, access_token: accessToken }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error?.message || "Facebook API Error");
              externalPostId = data.id;

            } else if (validImages.length === 1) {
              // ── Single photo post ──
              console.log("[Publisher] Posting single photo to Facebook...");
              const res = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, url: validImages[0], access_token: accessToken }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error?.message || "Facebook API Error");
              externalPostId = data.id || data.post_id;

            } else {
              // ── Multi-photo post (Album) ──
              console.log(`[Publisher] Uploading ${validImages.length} photos as unpublished...`);
              const photoIds: string[] = [];

              for (const imgUrl of validImages) {
                const uploadRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    url: imgUrl,
                    published: false,
                    access_token: accessToken,
                  }),
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadData.error?.message || `Photo upload failed: ${imgUrl}`);
                photoIds.push(uploadData.id);
                console.log(`[Publisher] Uploaded photo → ID: ${uploadData.id}`);
              }

              // Create the multi-photo post
              console.log("[Publisher] Creating multi-photo post with attached_media...");
              const feedRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  message,
                  attached_media: photoIds.map(id => ({ media_fbid: id })),
                  access_token: accessToken,
                }),
              });
              const feedData = await feedRes.json();
              if (!feedRes.ok) throw new Error(feedData.error?.message || "Facebook multi-photo post failed");
              externalPostId = feedData.id;
            }

            console.log(`[Publisher] Success! FB Post ID: ${externalPostId}`);

            // Update PostTarget as SUCCESS
            await prisma.postTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                externalPostId: externalPostId,
              },
            });

          } else if (target.socialConnection.platform === "INSTAGRAM") {
            const igAccountId = target.socialConnection.accountId;
            const accessToken = target.socialConnection.accessToken;
            const message = post.content;

            const validImages = post.media
              .filter(m => m.mediaAsset.fileType === "IMAGE")
              .map(m => m.mediaAsset.fileUrl)
              .filter(url => url && url.startsWith("http"));

            const validVideos = post.media
              .filter(m => m.mediaAsset.fileType === "VIDEO")
              .map(m => m.mediaAsset.fileUrl)
              .filter(url => url && url.startsWith("http"));

            let containerId: string;
            let externalPostId: string;

            if (validVideos.length > 0) {
              console.log("[Publisher] Initializing Instagram Video/Reels upload container...");
              const res = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  media_type: "REELS",
                  video_url: validVideos[0],
                  caption: message,
                  access_token: accessToken,
                }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error?.message || "Instagram Video Container Init Failed");
              containerId = data.id;

              let finished = false;
              let attempts = 0;
              while (!finished && attempts < 15) {
                console.log(`[Publisher] Checking Instagram Video Container status... Attempt: ${attempts}`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                const pollRes = await fetch(`https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`);
                const pollData = await pollRes.json();
                if (pollData.status_code === "FINISHED") {
                  finished = true;
                } else if (pollData.status_code === "ERROR") {
                  throw new Error("Instagram Video Container Processing Error");
                }
                attempts++;
              }
              if (!finished) throw new Error("Instagram Video Container Processing Timeout");
            } else if (validImages.length > 0) {
              console.log("[Publisher] Initializing Instagram Photo upload container...");
              const res = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  image_url: validImages[0],
                  caption: message,
                  access_token: accessToken,
                }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error?.message || "Instagram Image Container Init Failed");
              containerId = data.id;
            } else {
              throw new Error("Instagram posts require at least one image or video.");
            }

            console.log("[Publisher] Publishing Instagram container...");
            const pubRes = await fetch(`https://graph.facebook.com/v19.0/${igAccountId}/media_publish`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                creation_id: containerId,
                access_token: accessToken,
              }),
            });
            const pubData = await pubRes.json();
            if (!pubRes.ok) throw new Error(pubData.error?.message || "Instagram Media Publish Failed");
            externalPostId = pubData.id;

            console.log(`[Publisher] Success! IG Media ID: ${externalPostId}`);
            await prisma.postTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                externalPostId: externalPostId,
              },
            });

          } else if (target.socialConnection.platform === "TIKTOK") {
            const accessToken = target.socialConnection.accessToken;
            const message = post.content;

            const validImages = post.media
              .filter(m => m.mediaAsset.fileType === "IMAGE")
              .map(m => m.mediaAsset.fileUrl)
              .filter(url => url && url.startsWith("http"));

            const validVideos = post.media
              .filter(m => m.mediaAsset.fileType === "VIDEO")
              .map(m => m.mediaAsset.fileUrl)
              .filter(url => url && url.startsWith("http"));

            let publishId: string;

            if (validVideos.length > 0) {
              console.log("[Publisher] Initializing TikTok Video post via Pull URL...");
              const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  post_info: {
                    title: message,
                    privacy_level: "PUBLIC_TO_EVERYONE"
                  },
                  source_info: {
                    source: "PULL_FROM_URL",
                    video_url: validVideos[0]
                  }
                })
              });
              const data = await res.json();
              if (data.error?.code !== "ok") throw new Error(data.error?.message || "TikTok Video Init Failed");
              publishId = data.data.publish_id;
            } else if (validImages.length > 0) {
              console.log("[Publisher] Initializing TikTok Photo/Content post via Pull URL...");
              const res = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${accessToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  post_info: {
                    title: message,
                    privacy_level: "PUBLIC_TO_EVERYONE"
                  },
                  source_info: {
                    source: "PULL_FROM_URL",
                    photo_cover_index: 0,
                    photo_images: validImages
                  },
                  post_mode: "MEDIA_POST"
                })
              });
              const data = await res.json();
              if (data.error?.code !== "ok") throw new Error(data.error?.message || "TikTok Content Init Failed");
              publishId = data.data.publish_id;
            } else {
              throw new Error("TikTok posts require at least one image or video.");
            }

            console.log(`[Publisher] Success! TikTok Publish ID: ${publishId}`);
            await prisma.postTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                externalPostId: publishId,
              },
            });

          } else if (target.socialConnection.platform === "YOUTUBE") {
            const accessToken = target.socialConnection.accessToken;
            const message = post.content;

            const validVideos = post.media
              .filter(m => m.mediaAsset.fileType === "VIDEO")
              .map(m => m.mediaAsset.fileUrl)
              .filter(url => url && url.startsWith("http"));

            if (validVideos.length === 0) {
              throw new Error("YouTube posts require at least one video.");
            }

            console.log("[Publisher] Initializing YouTube resumable upload session...");
            const initRes = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json; charset=UTF-8",
                "X-Upload-Content-Type": "video/*"
              },
              body: JSON.stringify({
                snippet: {
                  title: message.substring(0, 100) || "Auto Uploaded Video",
                  description: message
                },
                status: {
                  privacyStatus: "public",
                  selfDeclaredMadeForKids: false
                }
              })
            });

            if (!initRes.ok) {
              const initErr = await initRes.json();
              throw new Error(initErr.error?.message || "YouTube Resumable Init Failed");
            }

            const uploadUrl = initRes.headers.get("Location");
            if (!uploadUrl) throw new Error("YouTube upload URL location header missing");

            console.log("[Publisher] Downloading video stream from media asset URL...");
            const videoFetch = await fetch(validVideos[0]);
            if (!videoFetch.ok) throw new Error("Failed to download video asset for YouTube upload");
            const videoBuffer = await videoFetch.arrayBuffer();

            console.log("[Publisher] Streaming video to YouTube...");
            const uploadRes = await fetch(uploadUrl, {
              method: "PUT",
              headers: {
                "Content-Length": videoBuffer.byteLength.toString(),
                "Content-Type": "video/*"
              },
              body: Buffer.from(videoBuffer)
            });

            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.error?.message || "YouTube Video Upload PUT Failed");
            
            const youtubeId = uploadData.id;
            console.log(`[Publisher] Success! YouTube Video ID: ${youtubeId}`);

            await prisma.postTarget.update({
              where: { id: target.id },
              data: {
                status: "PUBLISHED",
                externalPostId: youtubeId,
              },
            });

          } else {
             // Handle other platforms (TWITTER, LINKEDIN) later
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
