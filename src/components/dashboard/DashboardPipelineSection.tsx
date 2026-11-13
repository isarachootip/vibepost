import React from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Sliders, Sparkles } from "lucide-react";

interface DashboardPipelineSectionProps {
  hasPromptConfigs: boolean;
}

export function DashboardPipelineSection({
  hasPromptConfigs,
}: DashboardPipelineSectionProps) {
  const steps = [
    {
      step: "01",
      title: "Setup Brand & Prompt",
      desc: "ตั้งค่าข้อมูลแบรนด์ โทนเสียง และคำสั่ง Prompt สำหรับให้ AI สร้างคอนเทนต์",
      href: "/dashboard/settings",
      cta: hasPromptConfigs ? "จัดการการตั้งค่า" : "เริ่มตั้งค่า",
      icon: Sliders,
      badgeBg: "neu-tint-primary",
    },
    {
      step: "02",
      title: "AI Generation & Studio",
      desc: "AI ผลิตแคปชัน 3 สไตล์พร้อมสื่อรูปภาพและวิดีโอเพื่อตรวจสอบและอนุมัติ",
      href: "/dashboard/ai-studio",
      cta: "เปิด AI Studio",
      icon: Sparkles,
      badgeBg: "neu-tint-teal",
    },
    {
      step: "03",
      title: "Schedule & Auto-Publish",
      desc: "ตั้งเวลาและยิงส่งคอนเทนต์ไปยัง Facebook Page, Instagram, TikTok อัตโนมัติ",
      href: "/dashboard/social",
      cta: "จัดการช่องทางเชื่อมต่อ",
      icon: CalendarCheck,
      badgeBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_6px_18px_-4px_rgba(16,185,129,0.45)]",
    },
  ];

  return (
    <section className="neu-raised neu-grain rounded-3xl border border-[var(--border)] p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="font-display text-base sm:text-lg text-foreground flex items-center gap-2.5">
            <span className="neu-tint-primary inline-block w-2 h-5 rounded-full" />
            <span>3 ขั้นตอนการทำงานจากไอเดียสู่การโพสต์อัตโนมัติ</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            สายพานการผลิตอัตโนมัติที่เชื่อมโยง AI Studio เข้ากับเครือข่ายโซเชียลของคุณ
          </p>
        </div>
        <span className="neu-pressed self-start sm:self-auto rounded-full px-3 py-1 font-mono text-[11px] font-bold text-primary-ink border border-[var(--border)]">
          Automated Pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="neu-pressed rounded-2xl border border-[var(--border)] p-5 flex flex-col justify-between gap-4 transition-all hover:border-primary/40"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`grid size-11 place-items-center rounded-2xl ${item.badgeBg}`}>
                    <Icon className="size-5" />
                  </div>
                  <span className="font-mono text-xs font-extrabold text-muted-foreground">
                    STEP {item.step}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-sm text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground mt-1.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              <Link
                href={item.href}
                className="neu-raised inline-flex items-center justify-between gap-2 rounded-xl border border-[var(--border-control)] px-3.5 py-2 text-xs font-bold text-foreground hover:text-primary-ink hover:border-primary/40 transition-all"
              >
                <span>{item.cta}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
