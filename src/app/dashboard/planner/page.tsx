import { getUserWorkspaces } from "@/lib/actions/workspace";
import { loadOverviewInputs } from "@/lib/repositories/planner/overview.repository";
import { buildBrandSummary } from "@/lib/services/planner/planner-overview.service";
import { BrandOverviewCard } from "@/components/planner/BrandOverviewCard";
import { PlannerHeader } from "@/components/planner/PlannerHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Content Planner | Vibe Post",
  description: "ภาพรวมแผนคอนเทนต์ของทุก Brand",
};

export default async function PlannerOverviewPage() {
  // getUserWorkspaces is already scoped: members see their brands, super admin sees all.
  const workspaces = await getUserWorkspaces();
  const now = new Date();
  const inputs = await loadOverviewInputs(
    workspaces.map((w) => w.id),
    now
  );

  return (
    <div className="animate-in fade-in pb-12">
      <PlannerHeader
        title="🗺️ Content Planner"
        subtitle="ภาพรวมแผนคอนเทนต์ของทุก Brand · กดการ์ดเพื่อดู Topic และ Campaign"
      />

      {workspaces.length === 0 ? (
        <div className="neu-pressed rounded-3xl border border-[var(--border)] py-12 text-center text-sm text-muted-foreground">
          ยังไม่มี Brand (Workspace) — สร้างได้ที่เมนู Workspaces
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {workspaces.map((w) => {
            const input = inputs.get(w.id);
            if (!input) return null;
            return (
              <BrandOverviewCard
                key={w.id}
                workspaceId={w.id}
                name={w.name}
                summary={buildBrandSummary(input, now)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
