"use server";

import { prisma } from "@/lib/prisma";

export type PublishedPostForGallery = {
  id: string;
  content: string;
  publishedTime: Date | null;
  workspace: string;
  images: { url: string; fileName: string }[];
  channels: {
    platform: string;
    accountName: string;
    status: string;
  }[];
};

export async function getPublishedPostsForLanding(): Promise<{
  posts: PublishedPostForGallery[];
  totalPosts: number;
  totalChannels: number;
}> {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedTime: "desc" },
      take: 60,
      include: {
        media: {
          include: {
            mediaAsset: {
              select: { fileUrl: true, fileType: true, fileName: true },
            },
          },
        },
        targets: {
          include: {
            socialConnection: {
              select: { platform: true, accountName: true },
            },
          },
        },
        workspace: { select: { name: true } },
      },
    });

    // Count unique platforms across all posts
    const platformSet = new Set<string>();
    posts.forEach((post) => {
      post.targets.forEach((t) =>
        platformSet.add(t.socialConnection.platform)
      );
    });

    const data: PublishedPostForGallery[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      publishedTime: post.publishedTime,
      workspace: post.workspace.name,
      images: post.media
        .filter((m) => m.mediaAsset.fileType === "IMAGE")
        .map((m) => ({
          url: m.mediaAsset.fileUrl,
          fileName: m.mediaAsset.fileName,
        })),
      channels: post.targets.map((t) => ({
        platform: t.socialConnection.platform,
        accountName: t.socialConnection.accountName,
        status: t.status,
      })),
    }));

    return {
      posts: data,
      totalPosts: data.length,
      totalChannels: platformSet.size,
    };
  } catch {
    return { posts: [], totalPosts: 0, totalChannels: 0 };
  }
}

import { getActiveWorkspaceContext } from "./workspace";
import { revalidatePath } from "next/cache";

export async function generateAIPost(topic: string, variantCount: number) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");

  const promptConfig = await prisma.promptConfig.findFirst({
    where: { workspaceId: workspace.id, isActive: true },
  });

  if (!promptConfig) {
    throw new Error("No active AI Prompt Configuration found. Please set it up in Settings.");
  }

  const systemPrompt = "You are an expert social media manager. Generate engaging social media captions based on the user's topic. Do NOT wrap the response in markdown blocks. Output exactly the requested number of variations separated by '|||'. Example: variation 1 ||| variation 2";
  const userPrompt = `Topic: ${topic}\nPlease generate ${variantCount} different variations of a social media caption for this topic. Separate each variation strictly with '|||'.`;

  try {
    let textContent = "";

    if (promptConfig.provider === "GEMINI") {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${promptConfig.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
          }]
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to call Gemini API");
      }
      textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${promptConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to call OpenRouter API");
      }
      textContent = data.choices[0].message.content;
    }

    const variants = textContent.split("|||").map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    
    return { success: true, variants };
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return { success: false, error: error.message, variants: [] };
  }
}

export async function createScheduledPost(data: {
  content: string;
  scheduledTime: Date | null;
  targetConnectionIds: string[];
  imageUrl?: string;
}) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");

  if (data.targetConnectionIds.length === 0) {
    return { success: false, error: "Please select at least one social channel." };
  }

  try {
    const isPostNow = !data.scheduledTime || new Date(data.scheduledTime) <= new Date();
    const finalScheduledTime = isPostNow ? new Date() : new Date(data.scheduledTime!);

    const newPost = await prisma.post.create({
      data: {
        workspaceId: workspace.id,
        content: data.content,
        status: "SCHEDULED",
        scheduledTime: finalScheduledTime,
        targets: {
          create: data.targetConnectionIds.map((id) => ({
            socialConnectionId: id,
            status: "SCHEDULED",
          })),
        },
      },
    });

    if (data.imageUrl) {
      // In a real app, you'd upload this file. Here we just create an asset record with the URL.
      const asset = await prisma.mediaAsset.create({
        data: {
          workspaceId: workspace.id,
          fileName: "uploaded_image.jpg",
          fileUrl: data.imageUrl,
          fileType: "IMAGE",
          status: "APPROVED",
        }
      });

      await prisma.postMedia.create({
        data: {
          postId: newPost.id,
          mediaAssetId: asset.id,
        }
      });
    }

    revalidatePath("/dashboard/multi-post");
    revalidatePath("/dashboard/history");

    return { success: true, isPostNow };
  } catch (error: any) {
    console.error("Create Post Error:", error);
    return { success: false, error: error.message };
  }
}

