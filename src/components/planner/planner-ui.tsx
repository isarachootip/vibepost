import { cn } from "@/lib/utils";
import type { Tone } from "./planner-labels";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "border-[var(--border)] text-muted-foreground",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function StatusBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold whitespace-nowrap",
        TONE_CLASS[tone]
      )}
    >
      {children}
    </span>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-[var(--border-control)] bg-[var(--surface-elevated)]/80 px-3 py-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
      {label}
      {children}
      {hint && <span className="font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function formatThaiDate(d: Date, withTime = false): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Bangkok",
  }).format(d);
}
