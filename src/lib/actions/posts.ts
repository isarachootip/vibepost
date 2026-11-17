"use server";

import { revalidatePath } from "next/cache";
import { getActiveWorkspaceContext } from "./workspace";
import type { PublishMode } from "@/lib/validations/post-schedule.schema";
import {
  fetchPublishedPostsForLanding,
  type LandingShowcasePayload,
  type PublishedPostForGallery as GalleryPostRecord,
} from "@/lib/repositories/posts/post-gallery.repository";
import {
  fetchTrashPostsForWorkspace,
  fetchWorkspacePublishedHistory,
} from "@/lib/repositories/posts/post-history.repository";
import {
  permanentlyDeletePost,
  resolveUserWorkspaceRole,
  restoreSoftDeletedPost,
  softDeletePostInWorkspace,
  type WorkspaceAccessRole,
} from "@/lib/repositories/posts/post-trash.repository";
import {
  fetchDraftPostsForWorkspace,
  insertDraftPost,
  scheduleDraftAndMaybePublish,
  type DraftPostItem as DraftPostRecord,
} from "@/lib/repositories/posts/post-drafts.repository";
import {
  createAndPublishScheduledPost,
  generateAICaptionVariants,
} from "@/lib/services/post-scheduling.service";

export type PublishedPostForGallery = GalleryPostRecord;
export type DraftPostItem = DraftPostRecord;

export async function getPublishedPostsForLanding(options?: {
  includeHidden?: boolean;
}): Promise<LandingShowcasePayload> {
  return fetchPublishedPostsForLanding(options);
}

export async function getWorkspacePublishedPostsAction(): Promise<{
  posts: PublishedPostForGallery[];
  totalPosts: number;
  totalChannels: number;
}> {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) return { posts: [], totalPosts: 0, totalChannels: 0 };
  return fetchWorkspacePublishedHistory(workspace.id);
}

export async function getUserWorkspaceRole(
  workspaceId: string
): Promise<WorkspaceAccessRole> {
  return resolveUserWorkspaceRole(workspaceId);
}

export async function generateAIPost(
  topic: string,
  variantCount: number,
  language: string = "Thai"
) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");
  return generateAICaptionVariants(workspace.id, topic, variantCount, language);
}

export async function createScheduledPost(data: {
  content: string;
  scheduledTime: Date | null;
  targetConnectionIds: string[];
  imageUrls?: string[];
  imageUrl?: string;
  publishMode?: PublishMode;
}) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");

  const result = await createAndPublishScheduledPost(workspace.id, data);
  if (result.success) {
    revalidatePath("/");
    revalidatePath("/dashboard/multi-post");
    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/monitor");
  }
  return result;
}

export async function movePostToTrash(postId: string) {
  const result = await softDeletePostInWorkspace(postId);
  if (result.success) {
    revalidatePath("/");
    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/trash");
    revalidatePath("/dashboard/monitor");
  }
  return result;
}

export async function restorePostFromTrash(postId: string) {
  const result = await restoreSoftDeletedPost(postId);
  if (result.success) {
    revalidatePath("/");
    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/trash");
  }
  return result;
}

export async function deletePostPermanently(postId: string) {
  const result = await permanentlyDeletePost(postId);
  if (result.success) {
    revalidatePath("/");
    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/trash");
  }
  return result;
}

export async function getTrashPosts(): Promise<{
  posts: PublishedPostForGallery[];
  totalPosts: number;
}> {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) return { posts: [], totalPosts: 0 };
  return fetchTrashPostsForWorkspace(workspace.id);
}

export async function createDraftPost(data: {
  content: string;
  targetConnectionIds?: string[];
  imageUrl?: string;
  imageUrls?: string[];
}) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");

  const result = await insertDraftPost(workspace.id, data);
  if (result.success) {
    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/monitor");
    revalidatePath("/dashboard/ai-studio");
  }
  return result;
}

export async function getDraftPostsAction(): Promise<{
  success: boolean;
  drafts: DraftPostItem[];
  error?: string;
}> {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) return { success: false, drafts: [], error: "Workspace not found" };
  return fetchDraftPostsForWorkspace(workspace.id);
}

export async function publishDraftPostAction(data: {
  postId: string;
  content: string;
  targetConnectionIds: string[];
  scheduledTime: Date | null;
  publishMode?: PublishMode;
}) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) throw new Error("Workspace not found");

  const result = await scheduleDraftAndMaybePublish(workspace.id, data);
  if (result.success) {
    revalidatePath("/");
    revalidatePath("/dashboard/history");
    revalidatePath("/dashboard/monitor");
  }
  return result;
}
