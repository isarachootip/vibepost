import { prisma } from "@/lib/prisma";
import {
  publishDraftPostInputSchema,
  type PublishMode,
} from "@/lib/validations/post-schedule.schema";
import { validateScheduledTime } from "@/lib/services/schedule-time.service";
import { executeAutoPost } from "@/lib/services/publisher";
import { resolveUserWorkspaceRole } from "./post-trash.repository";
import { attachMediaUrlsToPost } from "./post-media.repository";

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

export async function insertDraftPost(
  workspaceId: string,
  data: {
    content: string;
    targetConnectionIds?: string[];
    imageUrl?: string;
    imageUrls?: string[];
  }
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const role = await resolveUserWorkspaceRole(workspaceId);
  if (!role || role === "VIEWER") {
    return { success: false, error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสร้างแบบร่างได้" };
  }

  const allMediaUrls = [
    ...(data.imageUrls ?? []),
    ...(data.imageUrl ? [data.imageUrl] : []),
  ].filter(Boolean);

  try {
    const newPost = await prisma.post.create({
      data: {
        workspaceId,
        content: data.content,
        status: "DRAFT",
        scheduledTime: null,
        targets:
          data.targetConnectionIds && data.targetConnectionIds.length > 0
            ? {
                create: data.targetConnectionIds.map((id) => ({
                  socialConnectionId: id,
                  status: "DRAFT",
                })),
              }
            : undefined,
      },
    });

    if (allMediaUrls.length > 0) {
      await attachMediaUrlsToPost(workspaceId, newPost.id, allMediaUrls, "PENDING");
    }

    return { success: true, postId: newPost.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ไม่สามารถสร้างแบบร่างได้";
    console.error("Create Draft Error:", message);
    return { success: false, error: message };
  }
}

export async function fetchDraftPostsForWorkspace(workspaceId: string): Promise<{
  success: boolean;
  drafts: DraftPostItem[];
  error?: string;
}> {
  try {
    const posts = await prisma.post.findMany({
      where: { workspaceId, status: "DRAFT", isDeleted: false },
      orderBy: { createdAt: "desc" },
      include: {
        media: { include: { mediaAsset: true } },
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
        fileType: m.mediaAsset.fileType === "VIDEO" ? "VIDEO" : "IMAGE",
      })),
      targetConnectionIds: p.targets.map((t) => t.socialConnectionId),
    }));

    return { success: true, drafts };
  } catch (err: unknown) {
    return {
      success: false,
      drafts: [],
      error: err instanceof Error ? err.message : "ไม่สามารถดึงรายการแบบร่างได้",
    };
  }
}

export async function scheduleDraftAndMaybePublish(
  workspaceId: string,
  data: {
    postId: string;
    content: string;
    targetConnectionIds: string[];
    scheduledTime: Date | null;
    publishMode?: PublishMode;
  }
) {
  const role = await resolveUserWorkspaceRole(workspaceId);
  if (!role || role === "VIEWER") {
    return {
      success: false,
      error: "สิทธิ์ไม่เพียงพอ — Viewer หรือผู้ที่ไม่ได้เป็นสมาชิกไม่สามารถเผยแพร่โพสต์ได้",
    };
  }

  const parsed = publishDraftPostInputSchema.safeParse({
    ...data,
    scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "ข้อมูลการเผยแพร่แบบร่างไม่ถูกต้อง",
    };
  }

  const mode: PublishMode =
    parsed.data.publishMode ?? (parsed.data.scheduledTime ? "SCHEDULE" : "NOW");
  const timeValidation = validateScheduledTime(parsed.data.scheduledTime, mode);
  if (!timeValidation.valid) {
    return { success: false, error: timeValidation.error };
  }

  try {
    const draftPost = await prisma.post.findFirst({
      where: { id: parsed.data.postId, workspaceId, isDeleted: false },
    });
    if (!draftPost) {
      return { success: false, error: "ไม่พบโพสต์แบบร่างใน Workspace นี้" };
    }

    const uniqueTargetIds = Array.from(new Set(parsed.data.targetConnectionIds));
    const validTargetsCount = await prisma.socialConnection.count({
      where: { id: { in: uniqueTargetIds }, workspaceId },
    });
    if (validTargetsCount !== uniqueTargetIds.length) {
      return { success: false, error: "ช่องทางโซเชียลที่เลือกไม่ถูกต้องหรือไม่ได้อยู่ใน Workspace นี้" };
    }

    const { isPostNow, finalTime } = timeValidation;

    await prisma.$transaction([
      prisma.postTarget.deleteMany({ where: { postId: draftPost.id } }),
      prisma.post.update({
        where: { id: draftPost.id },
        data: {
          content: parsed.data.content,
          status: "SCHEDULED",
          scheduledTime: finalTime,
          targets: {
            create: uniqueTargetIds.map((id) => ({
              socialConnectionId: id,
              status: "SCHEDULED",
            })),
          },
        },
      }),
    ]);

    if (isPostNow) {
      await executeAutoPost({ postId: draftPost.id });
    }

    return { success: true, isPostNow, scheduledTime: finalTime };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถเผยแพร่โพสต์ได้",
    };
  }
}
