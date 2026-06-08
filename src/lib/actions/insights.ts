"use server";

import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "./workspace";
import { revalidatePath } from "next/cache";

export async function syncPostInsights(postTargetId: string) {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) {
      return { success: false, error: "No active workspace" };
    }

    const postTarget = await prisma.postTarget.findFirst({
      where: {
        id: postTargetId,
        post: { workspaceId: workspace.id } // Security check
      },
      include: {
        socialConnection: true
      }
    });

    if (!postTarget) {
      return { success: false, error: "Post Target not found" };
    }

    const platform = postTarget.socialConnection.platform;
    if (!["FACEBOOK", "INSTAGRAM", "TIKTOK"].includes(platform)) {
      return { success: false, error: `Insights sync for ${platform} is not supported yet` };
    }

    if (!postTarget.externalPostId) {
      return { success: false, error: "Post has not been published to the platform yet (missing externalPostId)" };
    }

    const accessToken = postTarget.socialConnection.accessToken;
    const externalPostId = postTarget.externalPostId;

    let reach = 0;
    let engagement = 0;
    let impressions = 0;
    let clicks = 0; 

    switch (platform) {
      case "FACEBOOK": {
        // Fetch Insights from Graph API
        const url = `https://graph.facebook.com/v19.0/${externalPostId}/insights?metric=post_impressions_unique,post_engaged_users,post_impressions&access_token=${accessToken}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Failed to fetch Facebook insights");

        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((metric: any) => {
            const val = metric.values?.[0]?.value || 0;
            if (metric.name === "post_impressions_unique") reach = val;
            if (metric.name === "post_engaged_users") engagement = val;
            if (metric.name === "post_impressions") impressions = val;
          });
        }
        break;
      }
      case "INSTAGRAM": {
        // Instagram Graph API Insights
        const url = `https://graph.facebook.com/v19.0/${externalPostId}/insights?metric=impressions,reach,engagement&access_token=${accessToken}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Failed to fetch Instagram insights");

        if (data.data && Array.isArray(data.data)) {
          data.data.forEach((metric: any) => {
            const val = metric.values?.[0]?.value || 0;
            if (metric.name === "reach") reach = val;
            if (metric.name === "engagement") engagement = val;
            if (metric.name === "impressions") impressions = val;
          });
        }
        break;
      }
      case "TIKTOK": {
        // Mocking TikTok API for demonstration purposes
        // In production, this would call TikTok API endpoints like /v2/video/query/
        reach = Math.floor(Math.random() * 5000) + 1000;
        engagement = Math.floor(reach * 0.15); 
        impressions = Math.floor(reach * 1.2);
        clicks = Math.floor(reach * 0.05);
        await new Promise(resolve => setTimeout(resolve, 800));
        break;
      }
    }

    // Update the database
    await prisma.postTarget.update({
      where: { id: postTarget.id },
      data: {
        reach,
        engagement,
        impressions,
        clicks,
        insightsSyncedAt: new Date(),
      }
    });

    revalidatePath("/dashboard/monitor");
    
    return { 
      success: true, 
      data: { reach, engagement, impressions, clicks } 
    };

  } catch (error: any) {
    console.error("Sync Insights Error:", error);
    return { success: false, error: error.message };
  }
}
