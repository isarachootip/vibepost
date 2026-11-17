"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  togglePostPinSchema,
  togglePostShowcaseSchema,
  updateWorkspaceShowcaseSchema,
} from "@/lib/validations/showcase.schema";
import {
  authorizePostPinChange,
  authorizePostShowcaseChange,
  authorizeWorkspaceShowcaseChange,
  type ShowcaseRole,
} from "@/lib/services/showcase-visibility.service";

async function resolveShowcaseActor(workspaceId?: string): Promise<{
  authenticated: boolean;
  isSuperAdmin: boolean;
  workspaceRole: ShowcaseRole;
}> {
  const session = await auth();
  if (!session?.user?.email) {
    return { authenticated: false, isSuperAdmin: false, workspaceRole: null };
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!dbUser) {
    return { authenticated: false, isSuperAdmin: false, workspaceRole: null };
  }

  const isSuperAdmin = dbUser.role === "ADMIN";
  if (isSuperAdmin) {
    return { authenticated: true, isSuperAdmin: true, workspaceRole: "ADMIN" };
  }

  if (!workspaceId) {
    return { authenticated: true, isSuperAdmin: false, workspaceRole: null };
  }

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    select: { role: true },
  });

  const role: ShowcaseRole =
    member?.role === "ADMIN" || member?.role === "MEMBER" || member?.role === "VIEWER"
      ? member.role
      : null;

  return { authenticated: true, isSuperAdmin: false, workspaceRole: role };
}

export async function getIsSuperAdminSession(): Promise<boolean> {
  const actor = await resolveShowcaseActor();
  return actor.isSuperAdmin;
}

export async function togglePostShowcaseAction(rawInput: unknown): Promise<{
  success: boolean;
  showOnLanding?: boolean;
  error?: string;
}> {
  const parsed = togglePostShowcaseSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: parsed.data.postId },
      select: {
        id: true,
        workspaceId: true,
        workspace: { select: { showOnLanding: true } },
      },
    });
    if (!post) return { success: false, error: "ไม่พบโพสต์นี้ในระบบ" };

    const actor = await resolveShowcaseActor(post.workspaceId);
    if (!actor.authenticated) return { success: false, error: "กรุณาเข้าสู่ระบบ" };

    const authz = authorizePostShowcaseChange({
      isSuperAdmin: actor.isSuperAdmin,
      workspaceRole: actor.workspaceRole,
      workspaceShowOnLanding: post.workspace.showOnLanding,
      nextShowOnLanding: parsed.data.showOnLanding,
    });
    if (!authz.allowed) return { success: false, error: authz.error };

    await prisma.post.update({
      where: { id: post.id },
      data: {
        showOnLanding: parsed.data.showOnLanding,
        ...(parsed.data.showOnLanding ? {} : { isPinnedOnLanding: false }),
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard/history");
    return { success: true, showOnLanding: parsed.data.showOnLanding };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถอัปเดตการแสดงผลได้",
    };
  }
}

export async function togglePostPinAction(rawInput: unknown): Promise<{
  success: boolean;
  isPinnedOnLanding?: boolean;
  error?: string;
}> {
  const parsed = togglePostPinSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const actor = await resolveShowcaseActor();
    if (!actor.authenticated) return { success: false, error: "กรุณาเข้าสู่ระบบ" };

    const authz = authorizePostPinChange({ isSuperAdmin: actor.isSuperAdmin });
    if (!authz.allowed) return { success: false, error: authz.error };

    await prisma.post.update({
      where: { id: parsed.data.postId },
      data: {
        isPinnedOnLanding: parsed.data.isPinnedOnLanding,
        ...(parsed.data.isPinnedOnLanding ? { showOnLanding: true } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard/history");
    return { success: true, isPinnedOnLanding: parsed.data.isPinnedOnLanding };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถปักหมุดโพสต์ได้",
    };
  }
}

export async function updateWorkspaceShowcaseAction(rawInput: unknown): Promise<{
  success: boolean;
  showOnLanding?: boolean;
  error?: string;
}> {
  const parsed = updateWorkspaceShowcaseSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    const actor = await resolveShowcaseActor(parsed.data.workspaceId);
    if (!actor.authenticated) return { success: false, error: "กรุณาเข้าสู่ระบบ" };

    const authz = authorizeWorkspaceShowcaseChange({
      isSuperAdmin: actor.isSuperAdmin,
      workspaceRole: actor.workspaceRole,
      nextShowOnLanding: parsed.data.showOnLanding,
    });
    if (!authz.allowed) return { success: false, error: authz.error };

    await prisma.workspace.update({
      where: { id: parsed.data.workspaceId },
      data: { showOnLanding: parsed.data.showOnLanding },
    });

    revalidatePath("/");
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard/history");
    return { success: true, showOnLanding: parsed.data.showOnLanding };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถอัปเดตการตั้งค่าหน้าแรกได้",
    };
  }
}
