import { prisma } from "@/lib/prisma";
import { AuthError, requireUser, type GuardUser } from "@/lib/auth-guard";
import {
  hasWorkspaceRole,
  type WorkspaceRoleValue,
} from "@/lib/services/planner/campaign-status.service";

export interface PlannerAccess {
  user: GuardUser;
  role: WorkspaceRoleValue;
}

/** Resolves the caller's effective role in a workspace (super admin = ADMIN). Throws 403 if none. */
export async function getPlannerAccess(workspaceId: string): Promise<PlannerAccess> {
  const user = await requireUser();
  if (user.role === "ADMIN") return { user, role: "ADMIN" };
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    select: { role: true },
  });
  if (!member) throw new AuthError(403, "Forbidden");
  // A system-level VIEWER can never edit, regardless of workspace role.
  const role: WorkspaceRoleValue = user.role === "VIEWER" ? "VIEWER" : member.role;
  return { user, role };
}

/** Same as getPlannerAccess but enforces a minimum role. */
export async function requirePlannerRole(
  workspaceId: string,
  minRole: WorkspaceRoleValue
): Promise<PlannerAccess> {
  const access = await getPlannerAccess(workspaceId);
  if (!hasWorkspaceRole(access.role, minRole)) throw new AuthError(403, "Forbidden");
  return access;
}

export const PLANNER_PATH = "/dashboard/planner";
