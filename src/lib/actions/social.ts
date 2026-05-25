"use server";

import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { revalidatePath } from "next/cache";

export async function connectSocialPlatform(data: {
  platform: "FACEBOOK" | "INSTAGRAM" | "TWITTER" | "LINKEDIN" | "LINE" | "TIKTOK";
  accountName: string;
  accountId: string;
  accessToken: string;
}) {
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return { success: false, error: "No active workspace found." };
  }

  try {
    // Check if the platform is already connected
    const existing = await prisma.socialConnection.findFirst({
      where: {
        workspaceId: workspace.id,
        platform: data.platform,
        accountId: data.accountId,
      },
    });

    if (existing) {
      // Update existing connection
      await prisma.socialConnection.update({
        where: { id: existing.id },
        data: {
          accountId: data.accountId,
          accountName: data.accountName,
          accessToken: data.accessToken,
          isActive: true,
        },
      });
    } else {
      // Create new connection
      await prisma.socialConnection.create({
        data: {
          workspaceId: workspace.id,
          platform: data.platform,
          accountId: data.accountId,
          accountName: data.accountName,
          accessToken: data.accessToken,
        },
      });
    }

    revalidatePath("/dashboard/social");
    return { success: true };
  } catch (error: any) {
    console.error("Error connecting social platform:", error);
    return { success: false, error: error.message || "Failed to connect platform." };
  }
}

export async function disconnectSocialPlatform(connectionId: string) {
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return { success: false, error: "No active workspace found." };
  }

  try {
    await prisma.socialConnection.delete({
      where: {
        id: connectionId,
        workspaceId: workspace.id,
      },
    });

    revalidatePath("/dashboard/social");
    return { success: true };
  } catch (error: any) {
    console.error("Error disconnecting social platform:", error);
    return { success: false, error: error.message || "Failed to disconnect platform." };
  }
}
