import { notFound } from "next/navigation";
import { listTopics } from "@/lib/repositories/planner/topic.repository";
import { getWorkspaceName, listUnassignedPosts } from "@/lib/repositories/planner/overview.repository";
import { hasWorkspaceRole } from "@/lib/services/planner/campaign-status.service";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { TopicCard } from "@/components/planner/TopicCard";
import { TopicFormDialog } from "@/components/planner/TopicFormDialog";
import { UnassignedTray } from "@/components/planner/UnassignedTray";
import { requirePlannerPageAccess } from "../page-access";

export const dynamic = "force-dynamic";

export default async function BrandPlannerPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const { role } = await requirePlannerPageAccess(workspaceId);
  const [name, topics, unassigned] = await Promise.all([
    getWorkspaceName(workspaceId),
    listTopics(workspaceId),
    listUnassignedPosts(workspaceId),
  ]);
  if (!name) notFound();

  const canEdit = hasWorkspaceRole(role, "MEMBER");
  const activeTopics = topics.filter((t) => t.status === "ACTIVE");

  return (
    <div className="animate-in fade-in space-y-6 pb-12">
      <PlannerHeader
        title={name}
        subtitle="Topic / Pillar ของ Brand นี้ — กดเพื่อดู Campaign และแผนโพสต์"
        crumbs={[{ label: "Content Planner", href: "/dashboard/planner" }, { label: name }]}
        actions={canEdit ? <TopicFormDialog workspaceId={workspaceId} triggerLabel="+ สร้าง Topic" /> : undefined}
      />

      {topics.length === 0 ? (
        <div className="neu-pressed rounded-3xl border border-[var(--border)] py-12 text-center text-sm text-muted-foreground">
          ยังไม่มี Topic — เริ่มจากสร้าง Topic เช่น &quot;ยาง&quot; หรือ &quot;แบตเตอรี่&quot;
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {topics.map((t) => (
            <TopicCard
              key={t.id}
              href={`/dashboard/planner/${workspaceId}/topics/${t.id}`}
              name={t.name}
              color={t.color}
              archived={t.status === "ARCHIVED"}
              keywords={t.keywords}
              postCount={t._count.posts}
              campaignStatuses={t.campaigns.map((c) => c.status)}
            />
          ))}
        </div>
      )}

      <UnassignedTray
        workspaceId={workspaceId}
        posts={unassigned}
        topics={activeTopics.map((t) => ({ id: t.id, name: t.name }))}
        canEdit={canEdit}
      />
    </div>
  );
}
