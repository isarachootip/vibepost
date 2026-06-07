"use server";

import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { AIProvider } from "@prisma/client";

/** Check if the current user has admin rights for the active workspace */
async function requireWorkspaceAdmin(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.email) return false;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!dbUser) return false;

  // Super Admin always allowed
  if (dbUser.role === "ADMIN") return true;

  // Check workspace-level role
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

  // 🔒 Role Guard: only workspace ADMIN or Super Admin can save keys
  const isAdmin = await requireWorkspaceAdmin(workspace.id);
  if (!isAdmin) {
    return { success: false, error: "Permission denied. Only Workspace Admins can manage API keys." };
  }

  if (!apiKey || apiKey.trim() === "") {
    return { success: false, error: "API Key cannot be empty." };
  }

  try {
    const existing = await prisma.promptConfig.findFirst({
      where: {
        workspaceId: workspace.id,
        provider: provider,
      },
    });

    if (existing) {
      await prisma.promptConfig.update({
        where: { id: existing.id },
        data: {
          apiKey: apiKey.trim(),
          isActive: true,
        },
      });
    } else {
      await prisma.promptConfig.create({
        data: {
          workspaceId: workspace.id,
          provider: provider,
          apiKey: apiKey.trim(),
          isActive: true,
        },
      });
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving API Key:", error);
    return { success: false, error: error.message || "Failed to save API Key." };
  }
}

export async function deleteAIProviderKey(provider: AIProvider) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) {
    return { success: false, error: "No active workspace found." };
  }

  // 🔒 Role Guard: only workspace ADMIN or Super Admin can delete keys
  const isAdmin = await requireWorkspaceAdmin(workspace.id);
  if (!isAdmin) {
    return { success: false, error: "Permission denied. Only Workspace Admins can manage API keys." };
  }

  try {
    const existing = await prisma.promptConfig.findFirst({
      where: {
        workspaceId: workspace.id,
        provider: provider,
      },
    });

    if (existing) {
      await prisma.promptConfig.delete({
        where: { id: existing.id },
      });
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting API Key:", error);
    return { success: false, error: error.message || "Failed to delete API Key." };
  }
}
