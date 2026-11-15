// Pure domain rules for the Campaign lifecycle. No Prisma / Next imports.

export type CampaignStatusValue =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "ACTIVE"
  | "COMPLETED"
  | "ARCHIVED";

export type WorkspaceRoleValue = "VIEWER" | "MEMBER" | "ADMIN";

const ROLE_RANK: Record<WorkspaceRoleValue, number> = { VIEWER: 0, MEMBER: 1, ADMIN: 2 };

export function hasWorkspaceRole(actual: WorkspaceRoleValue, required: WorkspaceRoleValue): boolean {
  return ROLE_RANK[actual] >= ROLE_RANK[required];
}

interface TransitionRule {
  to: CampaignStatusValue;
  minRole: WorkspaceRoleValue;
}

const TRANSITIONS: Record<CampaignStatusValue, TransitionRule[]> = {
  DRAFT: [{ to: "PENDING_APPROVAL", minRole: "MEMBER" }],
  PENDING_APPROVAL: [
    { to: "APPROVED", minRole: "ADMIN" },
    { to: "DRAFT", minRole: "MEMBER" },
  ],
  APPROVED: [
    { to: "ACTIVE", minRole: "ADMIN" },
    { to: "DRAFT", minRole: "ADMIN" },
  ],
  ACTIVE: [{ to: "COMPLETED", minRole: "ADMIN" }],
  COMPLETED: [],
  ARCHIVED: [{ to: "DRAFT", minRole: "ADMIN" }],
};

export function canTransitionCampaign(
  from: CampaignStatusValue,
  to: CampaignStatusValue,
  role: WorkspaceRoleValue
): boolean {
  if (to === "ARCHIVED") {
    return from !== "ARCHIVED" && hasWorkspaceRole(role, "ADMIN");
  }
  const rule = TRANSITIONS[from].find((r) => r.to === to);
  return rule !== undefined && hasWorkspaceRole(role, rule.minRole);
}

/** Lists the statuses the given role may move a campaign to (for UI buttons). */
export function allowedCampaignTransitions(
  from: CampaignStatusValue,
  role: WorkspaceRoleValue
): CampaignStatusValue[] {
  const all: CampaignStatusValue[] = [
    "DRAFT",
    "PENDING_APPROVAL",
    "APPROVED",
    "ACTIVE",
    "COMPLETED",
    "ARCHIVED",
  ];
  return all.filter((to) => canTransitionCampaign(from, to, role));
}

/** Campaign details and its planned posts can be edited only in these states. */
export function isCampaignEditable(status: CampaignStatusValue): boolean {
  return status === "DRAFT" || status === "APPROVED" || status === "ACTIVE";
}
