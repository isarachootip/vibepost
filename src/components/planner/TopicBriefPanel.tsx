import type { TopicFormValues } from "./TopicFormDialog";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-bold text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

export function TopicBriefPanel({ topic }: { topic: TopicFormValues }) {
  return (
    <section className="neu-raised rounded-3xl border border-[var(--border)] p-5">
      <h2 className="mb-3 font-display text-base text-foreground">📝 Topic Brief</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        <Row label="กลุ่มเป้าหมาย" value={topic.audience} />
        <Row label="จุดขาย / สินค้า" value={topic.sellingPoints} />
        <Row label="โทนการเขียน" value={topic.tone} />
        <Row label="สิ่งที่ห้ามพูด" value={topic.forbidden} />
        <div className="sm:col-span-2">
          <dt className="text-[11px] font-bold text-muted-foreground">Keyword</dt>
          <dd className="mt-1 flex flex-wrap gap-1">
            {topic.keywords.length === 0 ? (
              <span className="text-sm text-muted-foreground">—</span>
            ) : (
              topic.keywords.map((k) => (
                <span key={k} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{k}</span>
              ))
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function PhasePlaceholder({ title, phase, text }: { title: string; phase: number; text: string }) {
  return (
    <section className="neu-pressed rounded-3xl border border-dashed border-[var(--border)] p-5 text-center">
      <p className="font-display text-sm text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{text} · มาใน Phase {phase}</p>
    </section>
  );
}
