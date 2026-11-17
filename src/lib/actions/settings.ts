"use server";

import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { AIProvider } from "@prisma/client";
import { updateDailyVideoQuotaSchema } from "@/lib/validations/veo-video.schema";

/** Check if the current user has admin rights for the active workspace */
async function requireWorkspaceAdmin(workspaceId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!dbUser) return false;

  if (dbUser.role === "ADMIN") return true;

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    select: { role: true },
  });

  return member?.role === "ADMIN";
}

export async function saveAIProviderKey(provider: AIProvider, apiKey: string) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) {
    return { success: false, error: "No active workspace found." };
  }

  const isAdmin = await requireWorkspaceAdmin(workspace.id);
  if (!isAdmin) {
    return { success: false, error: "Permission denied. Only Workspace Admins can manage API keys." };
  }

  if (!apiKey || apiKey.trim() === "") {
    return { success: false, error: "API Key cannot be empty." };
  }

  try {
    const existing = await prisma.promptConfig.findFirst({
      where: { workspaceId: workspace.id, provider },
    });

    if (existing) {
      await prisma.promptConfig.update({
        where: { id: existing.id },
        data: { apiKey: apiKey.trim(), isActive: true },
      });
    } else {
      await prisma.promptConfig.create({
        data: { workspaceId: workspace.id, provider, apiKey: apiKey.trim(), isActive: true },
      });
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save API Key.";
    console.error("Error saving API Key:", message);
    return { success: false, error: message };
  }
}

export async function deleteAIProviderKey(provider: AIProvider) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) {
    return { success: false, error: "No active workspace found." };
  }

  const isAdmin = await requireWorkspaceAdmin(workspace.id);
  if (!isAdmin) {
    return { success: false, error: "Permission denied. Only Workspace Admins can manage API keys." };
  }

  try {
    const existing = await prisma.promptConfig.findFirst({
      where: { workspaceId: workspace.id, provider },
    });

    if (existing) {
      await prisma.promptConfig.delete({ where: { id: existing.id } });
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete API Key.";
    console.error("Error deleting API Key:", message);
    return { success: false, error: message };
  }
}

export async function updateWorkspaceVideoQuotaAction(rawQuota: unknown) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) {
    return { success: false, error: "ไม่พบ Workspace ที่กำลังใช้งาน" };
  }

  const isAdmin = await requireWorkspaceAdmin(workspace.id);
  if (!isAdmin) {
    return {
      success: false,
      error: "สิทธิ์ไม่เพียงพอ — เฉพาะ Workspace Admin เท่านั้นที่ตั้งเพดานโควตาวิดีโอได้",
    };
  }

  const parsed = updateDailyVideoQuotaSchema.safeParse({ dailyVideoQuota: rawQuota });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "ค่าโควตาวิดีโอไม่ถูกต้อง",
    };
  }

  try {
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { dailyVideoQuota: parsed.data.dailyVideoQuota },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/ai-studio");
    revalidatePath("/dashboard/multi-post");
    return { success: true, dailyVideoQuota: parsed.data.dailyVideoQuota };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ไม่สามารถบันทึกโควตาวิดีโอได้";
    return { success: false, error: message };
  }
}
