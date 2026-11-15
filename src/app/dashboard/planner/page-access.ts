import { notFound } from "next/navigation";
import { AuthError } from "@/lib/auth-guard";
import { getPlannerAccess, type PlannerAccess } from "@/lib/actions/planner/access";

/** Page-level guard: non-members get a 404 so brand IDs are not confirmed to outsiders. */
export async function requirePlannerPageAccess(workspaceId: string): Promise<PlannerAccess> {
  try {
    return await getPlannerAccess(workspaceId);
  } catch (e) {
    if (e instanceof AuthError) notFound();
    throw e;
  }
}
