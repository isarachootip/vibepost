import { notFound } from "next/navigation";
import { getTopicDetail } from "@/lib/repositories/planner/topic.repository";
import { getWorkspaceName } from "@/lib/repositories/planner/overview.repository";
import { hasWorkspaceRole } from "@/lib/services/planner/campaign-status.service";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { TopicFormDialog } from "@/components/planner/TopicFormDialog";
import { TopicArchiveButton } from "@/components/planner/TopicArchiveButton";
import { TopicBriefPanel, PhasePlaceholder } from "@/components/planner/TopicBriefPanel";
import { CampaignFormDialog } from "@/components/planner/CampaignFormDialog";
import { CampaignCard } from "@/components/planner/CampaignCard";
import { requirePlannerPageAccess } from "../../../page-access";

export const dynamic = "force-dynamic";

type Params = Promise<{ workspaceId: string; topicId: string }>;

export default async function TopicPlannerPage({ params }: { params: Params }) {
  const { workspaceId, topicId } = await params;
  const { role } = await requirePlannerPageAccess(workspaceId);
  const [brandName, topic] = await Promise.all([
    getWorkspaceName(workspaceId),
    getTopicDetail(workspaceId, topicId),
  ]);
  if (!brandName || !topic) notFound();

  const canEdit = hasWorkspaceRole(role, "MEMBER");
  const isAdmin = hasWorkspaceRole(role, "ADMIN");
  const archived = topic.status === "ARCHIVED";
  const topicValues = {
    id: topic.id,
    name: topic.name,
    color: topic.color,
    audience: topic.audience,
    sellingPoints: topic.sellingPoints,
    keywords: topic.keywords,
    forbidden: topic.forbidden,
    tone: topic.tone,
  };

  return (
    <div className="animate-in fade-in space-y-6 pb-12">
      <PlannerHeader
        title={topic.name}
        subtitle={archived ? "Topic นี้ถูก Archive แล้ว" : "Campaign และแผนโพสต์ของ Topic นี้"}
        crumbs={[
          { label: "Content Planner", href: "/dashboard/planner" },
          { label: brandName, href: `/dashboard/planner/${workspaceId}` },
          { label: topic.name },
        ]}
        actions={
          <>
            {canEdit && !archived && (
              <TopicFormDialog workspaceId={workspaceId} topic={topicValues} triggerLabel="แก้ไข Topic" triggerVariant="neu" />
            )}
            {isAdmin && <TopicArchiveButton workspaceId={workspaceId} topicId={topic.id} archived={archived} />}
          </>
        }
      />

      <TopicBriefPanel topic={topicValues} />

      <div className="grid gap-4 md:grid-cols-2">
        <PhasePlaceholder title="📈 กราฟผลลัพธ์" phase={3} text="Reach / Engagement ที่ 1 ชม. → 30 วันหลังโพสต์" />
        <PhasePlaceholder title="🧠 Weekly AI Brief" phase={4} text="สรุป trend และสิ่งที่ควรทำต่อทุกวันจันทร์" />
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg text-foreground">🎯 Campaigns</h2>
          {canEdit && !archived && (
            <CampaignFormDialog workspaceId={workspaceId} topicId={topic.id} triggerLabel="+ สร้าง Campaign" />
          )}
        </div>
        {topic.campaigns.length === 0 ? (
          <div className="neu-pressed rounded-3xl border border-[var(--border)] py-10 text-center text-sm text-muted-foreground">
            ยังไม่มี Campaign — สร้าง Campaign แรก เช่น &quot;{topic.name} ช่วงปลายปี&quot;
          </div>
        ) : (
          topic.campaigns.map((c) => (
            <CampaignCard key={c.id} workspaceId={workspaceId} topicId={topic.id} role={archived ? "VIEWER" : role} campaign={c} />
          ))
        )}
      </section>
    </div>
  );
}
