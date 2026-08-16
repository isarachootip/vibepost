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
      where: { status: "PUBLISHED", isDeleted: false },
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
        externalPostId: t.externalPostId,
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
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Returns the user's role in the given workspace.
 * Super Admin (User.role=ADMIN) is treated as workspace ADMIN.
 * Returns null if not a member.
 */
export async function getUserWorkspaceRole(workspaceId: string): Promise<"ADMIN" | "MEMBER" | "VIEWER" | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!dbUser) return null;

  if (dbUser.role === "ADMIN") return "ADMIN"; // Super Admin

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    select: { role: true },
  });

  return (member?.role as "ADMIN" | "MEMBER" | "VIEWER") ?? null;
}

export async function generateAIPost(topic: string, variantCount: number, language: string = "Thai") {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");

  // 🔒 VIEWER cannot generate posts
  const role = await getUserWorkspaceRole(workspace.id);
  if (role === "VIEWER") {
    return { success: false, error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสร้าง Post ได้", variants: [] };
  }

  const promptConfig = await prisma.promptConfig.findFirst({
    where: { workspaceId: workspace.id, isActive: true },
  });

  if (!promptConfig) {
    throw new Error("No active AI Prompt Configuration found. Please set it up in Settings.");
  }

  const systemPrompt = `You are an expert social media manager. Generate engaging social media captions based on the user's topic. IMPORTANT: Write ALL content in ${language} language only. Do NOT wrap the response in markdown blocks. Output exactly the requested number of variations separated by '|||'. Example: variation 1 ||| variation 2`;
  const userPrompt = `Topic: ${topic}\nLanguage: ${language}\nPlease generate ${variantCount} different variations of a social media caption for this topic in ${language}. Separate each variation strictly with '|||'.`;

  try {
    let textContent = "";

    if (promptConfig.provider === "GEMINI") {
      // Priority order based on confirmed available models for this API key
      const geminiModels = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash",
        "gemini-2.0-flash-001",
      ];

      let geminiSuccess = false;
      let lastError = "";

      for (const modelName of geminiModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${promptConfig.apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
                }]
              }),
            }
          );
          const data = await response.json();
          if (!response.ok) {
            lastError = data.error?.message || `Model ${modelName} failed`;
            continue; // Try next model
          }
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            textContent = candidate;
            geminiSuccess = true;
            console.log(`Gemini: successfully used model ${modelName}`);
            break;
          }
        } catch (e: any) {
          lastError = e.message;
          continue;
        }
      }

      if (!geminiSuccess) {
        throw new Error(`All Gemini models failed. Last error: ${lastError}`);
      }
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
  imageUrls?: string[];     // multiple images (multi-photo) — replaces imageUrl
  imageUrl?: string;         // legacy single-image compat
}) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");

  // 🔒 VIEWER cannot create or schedule posts
  const role = await getUserWorkspaceRole(workspace.id);
  if (role === "VIEWER") {
    return { success: false, error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสร้าง Post ได้" };
  }

  if (data.targetConnectionIds.length === 0) {
    return { success: false, error: "Please select at least one social channel." };
  }

  // Merge imageUrls and legacy imageUrl into one array
  const allImageUrls: string[] = [
    ...(data.imageUrls ?? []),
    ...(data.imageUrl ? [data.imageUrl] : []),
  ].filter(Boolean);

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

    if (allImageUrls.length > 0) {
      for (const url of allImageUrls) {
        const ext = url.split(".").pop()?.toLowerCase() || "";
        const isVideo = ["mp4", "webm", "mov", "quicktime"].includes(ext);
        
        const asset = await prisma.mediaAsset.create({
          data: {
            workspaceId: workspace.id,
            fileName: url.split("/").pop() || (isVideo ? "video.mp4" : "image.jpg"),
            fileUrl: url,
            fileType: isVideo ? "VIDEO" : "IMAGE",
            status: "APPROVED",
          },
        });
        await prisma.postMedia.create({
          data: { postId: newPost.id, mediaAssetId: asset.id },
        });
      }
    }

    revalidatePath("/dashboard/multi-post");
    revalidatePath("/dashboard/history");

    return { success: true, isPostNow };
  } catch (error: any) {
    console.error("Create Post Error:", error);
    return { success: false, error: error.message };
  }
}

export async function movePostToTrash(postId: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { workspaceId: true }
    });
    if (!post) throw new Error("Post not found");

    const role = await getUserWorkspaceRole(post.workspaceId);
    if (role === "VIEWER") {
      throw new Error("สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถย้ายโพสต์ลงถังขยะได้");
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true }
    });

    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/trash");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function restorePostFromTrash(postId: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { workspaceId: true }
    });
    if (!post) throw new Error("Post not found");

    const role = await getUserWorkspaceRole(post.workspaceId);
    if (role === "VIEWER") {
      throw new Error("สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถกู้คืนโพสต์ได้");
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: false }
    });

    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/trash");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePostPermanently(postId: string) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { workspaceId: true }
    });
    if (!post) throw new Error("Post not found");

    const role = await getUserWorkspaceRole(post.workspaceId);
    if (role !== "ADMIN") {
      throw new Error("สิทธิ์ไม่เพียงพอ — เฉพาะ Admin เท่านั้นที่สามารถลบโพสต์ถาวรได้");
    }

    await prisma.postTarget.deleteMany({
      where: { postId }
    });

    await prisma.postMedia.deleteMany({
      where: { postId }
    });

    await prisma.post.delete({
      where: { id: postId }
    });

    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/trash");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTrashPosts(): Promise<{
  posts: PublishedPostForGallery[];
  totalPosts: number;
}> {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) return { posts: [], totalPosts: 0 };

    const posts = await prisma.post.findMany({
      where: {
        workspaceId: workspace.id,
        isDeleted: true
      },
      orderBy: { updatedAt: "desc" },
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

    const data: PublishedPostForGallery[] = posts.map((post) => ({
      id: post.id,
      content: post.content,
      publishedTime: post.publishedTime || post.updatedAt,
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
      totalPosts: data.length
    };
  } catch {
    return { posts: [], totalPosts: 0 };
  }
}

export type DraftPostItem = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  media: {
    url: string;
    fileName: string;
    fileType: "IMAGE" | "VIDEO";
  }[];
  targetConnectionIds: string[];
};

export async function createDraftPost(data: {
  content: string;
  targetConnectionIds?: string[];
  imageUrl?: string;
  imageUrls?: string[];
}) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");

  const role = await getUserWorkspaceRole(workspace.id);
  if (role === "VIEWER") {
    return { success: false, error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสร้างแบบร่างได้" };
  }

  const allImageUrls: string[] = [
    ...(data.imageUrls ?? []),
    ...(data.imageUrl ? [data.imageUrl] : []),
  ].filter(Boolean);

  try {
    const newPost = await prisma.post.create({
      data: {
        workspaceId: workspace.id,
        content: data.content,
        status: "DRAFT",
        scheduledTime: null,
        targets: data.targetConnectionIds && data.targetConnectionIds.length > 0 ? {
          create: data.targetConnectionIds.map((id) => ({
            socialConnectionId: id,
            status: "DRAFT",
          })),
        } : undefined,
      },
    });

    if (allImageUrls.length > 0) {
      for (const url of allImageUrls) {
        const ext = url.split(".").pop()?.toLowerCase() || "";
        const isVideo = ["mp4", "webm", "mov", "quicktime"].includes(ext);
        
        const asset = await prisma.mediaAsset.create({
          data: {
            workspaceId: workspace.id,
            fileName: url.split("/").pop() || (isVideo ? "video.mp4" : "image.jpg"),
            fileUrl: url,
            fileType: isVideo ? "VIDEO" : "IMAGE",
            status: "PENDING",
          },
        });
        await prisma.postMedia.create({
          data: { postId: newPost.id, mediaAssetId: asset.id },
        });
      }
    }

    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/monitor");
    revalidatePath("/dashboard/ai-studio");

    return { success: true, postId: newPost.id };
  } catch (error: any) {
    console.error("Create Draft Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getDraftPostsAction(): Promise<{
  success: boolean;
  drafts: DraftPostItem[];
  error?: string;
}> {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) return { success: false, drafts: [], error: "Workspace not found" };

    const posts = await prisma.post.findMany({
      where: {
        workspaceId: workspace.id,
        status: "DRAFT",
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        media: {
          include: {
            mediaAsset: true,
          },
        },
        targets: true,
      },
    });

    const drafts: DraftPostItem[] = posts.map((p) => ({
      id: p.id,
      content: p.content,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      media: p.media.map((m) => ({
        url: m.mediaAsset.fileUrl,
        fileName: m.mediaAsset.fileName,
        fileType: m.mediaAsset.fileType as "IMAGE" | "VIDEO",
      })),
      targetConnectionIds: p.targets.map((t) => t.socialConnectionId),
    }));

    return { success: true, drafts };
  } catch (err: any) {
    return { success: false, drafts: [], error: err.message };
  }
}

export async function publishDraftPostAction(data: {
  postId: string;
  content: string;
  targetConnectionIds: string[];
  scheduledTime: Date | null;
}) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");

  const role = await getUserWorkspaceRole(workspace.id);
  if (role === "VIEWER") {
    return { success: false, error: "สิทธิ์ไม่เพียงพอ" };
  }

  if (data.targetConnectionIds.length === 0) {
    return { success: false, error: "กรุณาเลือกช่องทางโซเชียลมีเดียอย่างน้อย 1 ช่องทาง" };
  }

  try {
    const isPostNow = !data.scheduledTime || new Date(data.scheduledTime) <= new Date();
    const finalScheduledTime = isPostNow ? new Date() : new Date(data.scheduledTime!);

    // Remove old targets and attach new
    await prisma.postTarget.deleteMany({
      where: { postId: data.postId },
    });

    await prisma.post.update({
      where: { id: data.postId },
      data: {
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

    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/monitor");

    return { success: true, isPostNow, scheduledTime: finalScheduledTime };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


