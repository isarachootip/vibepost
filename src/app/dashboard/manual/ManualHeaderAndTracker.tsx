"use client";

import { BookOpen, Check, Copy, Download, ExternalLink, Printer } from "lucide-react";
import { ONBOARDING_STEPS } from "./manual-data";

interface ManualHeaderAndTrackerProps {
  copied: boolean;
  completedSteps: string[];
  progressPercent: number;
  onCopyAll: () => void;
  onPrint: () => void;
  onToggleStep: (id: string) => void;
}

export function ManualHeaderAndTracker({
  copied,
  completedSteps,
  progressPercent,
  onCopyAll,
  onPrint,
  onToggleStep,
}: ManualHeaderAndTrackerProps) {
  return (
    <>
      {/* Top Hero Banner */}
      <header className="relative overflow-hidden rounded-[2rem] neu-raised neu-mesh-card neu-grain p-8 md:p-11">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-tint-primary border border-primary/25 text-xs font-bold tracking-wide text-primary">
            <BookOpen className="size-3.5" />
            VibePost Official Training &amp; User Manual
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
            คู่มือการฝึกอบรมการใช้งานระบบ{" "}
            <span className="bg-gradient-to-r from-primary via-violet-500 to-teal-400 bg-clip-text text-transparent">
              VibePost
            </span>
          </h1>
          <p className="text-muted-foreground font-normal max-w-3xl text-sm md:text-base leading-relaxed">
            คู่มือการใช้งานระบบและการฝึกอบรมภาคปฏิบัติ (Training Guide) สำหรับ Creator, ฝ่ายการตลาด, Admin และ Trainer
            ครอบคลุมกระบวนการตั้งแต่การตั้งค่าสมองกล AI, การสร้างคอนเทนต์, การบริหารคลังแบบร่าง จนถึงการปล่อยโพสต์อัตโนมัติบนโซเชียลมีเดีย
          </p>

          {/* Action Toolbar */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <a
              href="/downloads/VibePost_Training_Manual.docx"
              download="VibePost_Training_Manual.docx"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-lg shadow-primary/25 active:scale-95"
            >
              <Download className="size-4" />
              ดาวน์โหลดไฟล์ Word (.docx) สำหรับ Google Docs
            </a>

            <button
              onClick={onCopyAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl neu-raised border border-[var(--hairline-border)] text-foreground text-xs font-semibold transition-all hover:text-primary active:scale-95"
            >
              {copied ? <Check className="size-4 text-teal-500" /> : <Copy className="size-4" />}
              {copied ? "คัดลอกเนื้อหาทั้งหมดแล้ว!" : "คัดลอกเนื้อหา (สำหรับวางใน Google Docs)"}
            </button>

            <a
              href="https://docs.new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl neu-raised border border-[var(--hairline-border)] text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
            >
              <ExternalLink className="size-3.5 text-teal-500" />
              เปิด Google Docs ทันที (docs.new)
            </a>

            <button
              onClick={onPrint}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl neu-raised border border-[var(--hairline-border)] text-muted-foreground hover:text-foreground text-xs font-semibold transition-all"
              title="พิมพ์เอกสารหรือบันทึกเป็น PDF"
            >
              <Printer className="size-4" />
              พิมพ์ / PDF
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Onboarding Checklist Card */}
      <section className="neu-raised neu-grain rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--hairline-border)] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-600 dark:text-teal-300 text-xs font-bold">
                ✓
              </span>
              <h2 className="font-display text-lg font-bold text-foreground tracking-tight">
                บันทึกความคืบหน้าการฝึกอบรม (Training Progress Tracker)
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              สำหรับพนักงานใหม่และผู้เข้ารับการอบรม ติ๊กถูกหัวข้อที่ท่านได้ศึกษาและทดลองปฏิบัติจริงแล้ว
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-semibold text-muted-foreground">ผ่านแล้ว: </span>
              <span className="font-mono text-sm font-bold text-primary">
                {completedSteps.length} / {ONBOARDING_STEPS.length} หัวข้อ
              </span>
            </div>
            <div className="w-24 neu-pressed h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-teal-400 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {ONBOARDING_STEPS.map((step) => {
            const isDone = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                onClick={() => onToggleStep(step.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                  isDone
                    ? "neu-tint-teal border-teal-500/30"
                    : "neu-pressed border-[var(--hairline-border)] hover:border-primary/40"
                }`}
              >
                <div
                  className={`mt-0.5 rounded-lg p-1 transition-colors ${
                    isDone
                      ? "bg-teal-500 text-white"
                      : "border border-[var(--hairline-border)] text-transparent"
                  }`}
                >
                  <Check className="size-3.5 stroke-[3]" />
                </div>
                <div className="space-y-0.5">
                  <h3
                    className={`text-xs font-bold leading-snug ${
                      isDone
                        ? "text-teal-600 dark:text-teal-300 line-through opacity-85"
                        : "text-foreground"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
