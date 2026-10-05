import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type GuardUser = { id: string; email: string; role: "ADMIN" | "CREATOR" | "VIEWER" };

export class AuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

/** Returns the logged-in user (fresh role from DB) or throws AuthError(401). */
export async function requireUser(): Promise<GuardUser> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new AuthError(401, "Unauthorized");
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });
  if (!user) throw new AuthError(401, "Unauthorized");
  return user;
}

/** System-wide ADMIN (super admin). */
export async function requireSuperAdmin(): Promise<GuardUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new AuthError(403, "Forbidden");
  return user;
}

/** Any logged-in user except system VIEWER. */
export async function requireCreator(): Promise<GuardUser> {
  const user = await requireUser();
  if (user.role === "VIEWER") throw new AuthError(403, "Forbidden");
  return user;
}

const WS_RANK = { VIEWER: 0, MEMBER: 1, ADMIN: 2 } as const;

/** Requires membership in the workspace with at least `minRole`. Super admins always pass. */
export async function requireWorkspaceRole(
  workspaceId: string,
  minRole: keyof typeof WS_RANK = "MEMBER"
): Promise<GuardUser> {
  const user = await requireUser();
  if (user.role === "ADMIN") return user;
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    select: { role: true },
  });
  if (!member || WS_RANK[member.role] < WS_RANK[minRole]) {
    throw new AuthError(403, "Forbidden");
  }
  return user;
}

/** Converts AuthError into a JSON Response for route handlers. */
export function authErrorResponse(e: unknown): Response | null {
  if (e instanceof AuthError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  return null;
}
