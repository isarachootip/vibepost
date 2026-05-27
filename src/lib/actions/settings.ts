"use server";

import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { revalidatePath } from "next/cache";
import { AIProvider } from "@prisma/client";

export async function saveAIProviderKey(provider: AIProvider, apiKey: string) {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) {
    return { success: false, error: "No active workspace found." };
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
