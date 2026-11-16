import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type WorkspaceAccessRole = "ADMIN" | "MEMBER" | "VIEWER" | null;

export async function resolveUserWorkspaceRole(
  workspaceId: string
): Promise<WorkspaceAccessRole> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!dbUser) return null;

  if (dbUser.role === "ADMIN") return "ADMIN";

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    select: { role: true },
  });

  if (member?.role === "ADMIN" || member?.role === "MEMBER" || member?.role === "VIEWER") {
    return member.role;
  }
  return null;
}

export async function softDeletePostInWorkspace(postId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { workspaceId: true },
    });
    if (!post) throw new Error("Post not found");

    const role = await resolveUserWorkspaceRole(post.workspaceId);
    if (!role || role === "VIEWER") {
      throw new Error(
        "สิทธิ์ไม่เพียงพอ — เฉพาะสมาชิกที่มีสิทธิ์แก้ไขเท่านั้นที่สามารถย้ายโพสต์ลงถังขยะได้"
      );
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true },
    });

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถย้ายโพสต์ลงถังขยะได้",
    };
  }
}

export async function restoreSoftDeletedPost(postId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { workspaceId: true },
    });
    if (!post) throw new Error("Post not found");

    const role = await resolveUserWorkspaceRole(post.workspaceId);
    if (!role || role === "VIEWER") {
      throw new Error(
        "สิทธิ์ไม่เพียงพอ — เฉพาะสมาชิกที่มีสิทธิ์แก้ไขเท่านั้นที่สามารถกู้คืนโพสต์ได้"
      );
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: false },
    });

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถกู้คืนโพสต์ได้",
    };
  }
}

export async function permanentlyDeletePost(postId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { workspaceId: true },
    });
    if (!post) throw new Error("Post not found");

    const role = await resolveUserWorkspaceRole(post.workspaceId);
    if (role !== "ADMIN") {
      throw new Error("สิทธิ์ไม่เพียงพอ — เฉพาะ Admin เท่านั้นที่สามารถลบโพสต์ถาวรได้");
    }

    await prisma.$transaction([
      prisma.postTarget.deleteMany({ where: { postId } }),
      prisma.postMedia.deleteMany({ where: { postId } }),
      prisma.post.delete({ where: { id: postId } }),
    ]);

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถลบโพสต์ถาวรได้",
    };
  }
}
