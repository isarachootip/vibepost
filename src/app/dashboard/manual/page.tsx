"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Sparkles,
  Layers,
  Share2,
  FileText,
  Send,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Lightbulb,
  HelpCircle,
  Clock,
  Coins
} from "lucide-react";

interface TrainingStep {
  id: string;
  title: string;
  description: string;
}

const ONBOARDING_STEPS: TrainingStep[] = [
  {
    id: "step1",
    title: "1. ทำความเข้าใจภาพรวมระบบ & สิทธิ์ใน Workspace",
    description: "เข้าใจโครงสร้าง Multi-Workspace และบทบาทของ Admin, Member, Viewer"
  },
  {
    id: "step2",
    title: "2. เชื่อมต่อช่องทาง Facebook / Instagram",
    description: "ไปที่เมนู Integrations และล็อกอินเชื่อมต่อเพจโซเชียลมีเดียของแบรนด์"
  },
  {
    id: "step3",
    title: "3. ตั้งค่าคีย์ AI ในหน้า Settings",
    description: "กรอกคีย์ Google Gemini (คุมทั้ง Text, Imagen, Veo) และ Kling/Luma หากต้องการ"
  },
  {
    id: "step4",
    title: "4. ทดลองสร้างเนื้อหาใน AI Studio",
    description: "ป้อนบรีฟสินค้า เจนแคปชัน 3 สไตล์พร้อมกัน และสร้างภาพ/คลิปประกอบ"
  },
  {
    id: "step5",
    title: "5. ทดสอบ 3 เส้นทางการเผยแพร่คอนเทนต์",
    description: "ลองใช้ปุ่มโพสต์ทันที/ตั้งเวลา, บันทึกเป็นแบบร่าง (Draft), และเปิดใน Wizard ขั้นสูง"
  },
  {
    id: "step6",
    title: "6. ตรวจสอบคลังแบบร่างและติดตามผลใน Monitor",
    description: "ทดสอบการกด '🚀 ตั้งค่า & สั่งโพสต์' จาก Drafts Queue และดูประวัติใน Monitor"
  }
];

export default function TrainingManualPage() {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Load onboarding checklist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vibepost_training_completed_steps");
      if (saved) {
        setCompletedSteps(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleStep = (id: string) => {
    const updated = completedSteps.includes(id)
      ? completedSteps.filter((s) => s !== id)
      : [...completedSteps, id];
    setCompletedSteps(updated);
    try {
      localStorage.setItem("vibepost_training_completed_steps", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyAll = () => {
    const fullText = document.getElementById("manual-content")?.innerText || "";
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const progressPercent = Math.round(
    (completedSteps.length / ONBOARDING_STEPS.length) * 100
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-6xl mx-auto pb-16">
      {/* Top Hero Banner */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 md:p-12 text-white border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-[90px] -mr-24 -mt-24 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/15 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold tracking-wide text-indigo-300">
            <BookOpen className="size-3.5" />
            VibePost Official Training & User Manual
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-heading leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            คู่มือการฝึกอบรมการใช้งานระบบ VibePost
          </h1>
          <p className="text-slate-300 font-normal max-w-3xl text-sm md:text-base leading-relaxed">
            คู่มือการใช้งานระบบและการฝึกอบรมภาคปฏิบัติ (Training Guide) สำหรับ Creator, ฝ่ายการตลาด, Admin และ Trainer 
            ครอบคลุมกระบวนการตั้งแต่การตั้งค่าสมองกล AI, การสร้างคอนเทนต์, การบริหารคลังแบบร่าง จนถึงการปล่อยโพสต์อัตโนมัติบนโซเชียลมีเดีย
          </p>

          {/* Action Toolbar */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <a
              href="/downloads/VibePost_Training_Manual.docx"
              download="VibePost_Training_Manual.docx"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95"
            >
              <Download className="size-4" />
              ดาวน์โหลดไฟล์ Word (.docx) สำหรับ Google Docs
            </a>

            <button
              onClick={handleCopyAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
              {copied ? "คัดลอกเนื้อหาทั้งหมดแล้ว!" : "คัดลอกเนื้อหา (สำหรับวางใน Google Docs)"}
            </button>

            <a
              href="https://docs.new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <ExternalLink className="size-3.5 text-blue-400" />
              เปิด Google Docs ทันที (docs.new)
            </a>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              title="พิมพ์เอกสารหรือบันทึกเป็น PDF"
            >
              <Printer className="size-4" />
              พิมพ์ / PDF
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Onboarding Checklist Card */}
      <section className="bg-white dark:bg-[#181d27] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                ✓
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                บันทึกความคืบหน้าการฝึกอบรม (Training Progress Tracker)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              สำหรับพนักงานใหม่และผู้เข้ารับการอบรม ติ๊กถูกหัวข้อที่ท่านได้ศึกษาและทดลองปฏิบัติจริงแล้ว
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ผ่านแล้ว: </span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {completedSteps.length} / {ONBOARDING_STEPS.length} หัวข้อ
              </span>
            </div>
            <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {ONBOARDING_STEPS.map((step) => {
            const isDone = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                  isDone
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 shadow-2xs"
                    : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-white/5 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                <div
                  className={`mt-0.5 rounded-lg p-1 transition-colors ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : "border border-slate-300 dark:border-slate-600 text-transparent"
                  }`}
                >
                  <Check className="size-3.5 stroke-[3]" />
                </div>
                <div className="space-y-0.5">
                  <h3
                    className={`text-xs font-bold leading-snug ${
                      isDone
                        ? "text-emerald-900 dark:text-emerald-300 line-through opacity-85"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#181d27] p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xs">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "all", label: "ทั้งหมด" },
            { id: "overview", label: "1. ภาพรวมระบบ" },
            { id: "setup", label: "2. ตั้งค่า & เชื่อมต่อ" },
            { id: "studio", label: "3. AI Studio" },
            { id: "routes", label: "4. 3 เส้นทางโพสต์" },
            { id: "drafts", label: "5. คลังแบบร่าง" },
            { id: "monitor", label: "6. ติดตามผล & ค่าใช้จ่าย" },
            { id: "troubleshoot", label: "7. แก้ปัญหา" },
            { id: "googledocs", label: "8. นำเข้า Google Docs" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="ค้นหาคู่มือ เช่น Veo, Draft, Kling..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 size-3.5 text-slate-400" />
        </div>
      </div>

      {/* Manual Detailed Content Body */}
      <div id="manual-content" className="space-y-8 text-slate-800 dark:text-slate-200">
        
        {/* Section 1: Overview */}
        {(activeTab === "all" || activeTab === "overview") && (
          <article className="bg-white dark:bg-[#181d27] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  ภาพรวมระบบและสถาปัตยกรรม (System Overview)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  สถาปัตยกรรม Multi-Workspace และขุมพลัง Auto-Pilot
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              <strong>VibePost</strong> ถูกออกแบบขึ้นเพื่อให้ธุรกิจสามารถผลิตและกระจายคอนเทนต์ไปยังโซเชียลมีเดียได้อย่างรวดเร็ว แม่นยำ และประหยัดเวลา โดยผสาน AI ชั้นนำของโลกเข้าด้วยกัน ไม่ว่าจะเป็น Google Gemini (Text & Imagen), Google Veo, Luma Dream Machine, และ Kling AI ภายใต้ระบบรักษาความปลอดภัยที่แยก Workspace ของแต่ละแบรนด์อย่างเด็ดขาด
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <Layers className="size-4" /> Multi-Workspace Isolation
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  แยกข้อมูล สมาชิก ช่องทางโซเชียล และคีย์ API ของแต่ละบริษัทหรือแบรนด์เป็นอิสระต่อกันอย่างปลอดภัย 100%
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <Sparkles className="size-4" /> 3-in-1 Adaptive Text Engine
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  ป้อนบรีฟสั้นเพียงครั้งเดียว AI สร้างเนื้อหาพร้อมกัน 3 สไตล์: บทความยาว (Long-form), แคปชันสั้น (Social), และโครงสร้างโฆษณา (AIDA)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <Zap className="size-4" /> Auto-Pilot Cron Engine
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  ระบบคิวงานอัจฉริยะที่จะตรวจจับโพสต์และยิงเข้าสู่ Facebook และ Instagram ตามวันเวลาที่ตั้งไว้อัตโนมัติ
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
              💡 <strong>คำแนะนำสำหรับ Trainer:</strong> เน้นย้ำให้ผู้เข้ารับการอบรมทราบว่าระบบมี Fallback Protection ทั้งรูปภาพและวิดีโอ แม้ว่าโควตา API หรือเครือข่ายจะมีปัญหา ระบบจะดึงภาพสต็อกสวยงามมาใส่ให้ทันทีเพื่อไม่ให้ขั้นตอนการโพสต์สะดุด
            </div>
          </article>
        )}

        {/* Section 2: Setup & Integrations */}
        {(activeTab === "all" || activeTab === "setup") && (
          <article className="bg-white dark:bg-[#181d27] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  การตั้งค่าบัญชีและการเชื่อมต่อ (Workspace & Setup)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  การผูกเพจโซเชียลมีเดียและการใส่คีย์สมองกล AI
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                การเชื่อมต่อเพจ Facebook และ Instagram
              </h3>
              <ol className="list-decimal list-inside text-xs space-y-2 text-slate-600 dark:text-slate-300 ml-1 leading-relaxed">
                <li>ไปที่เมนู <strong className="text-slate-900 dark:text-white">Integrations</strong> ในแถบด้านซ้าย</li>
                <li>คลิกปุ่ม <strong className="text-indigo-600 dark:text-indigo-400">"เชื่อมต่อ Facebook / Instagram"</strong></li>
                <li>เข้าสู่ระบบบัญชี Facebook ของท่าน และเลือกเพจธุรกิจที่ต้องการมอบหมายให้ VibePost ดูแล</li>
                <li>อนุญาตสิทธิ์การจัดการเพจและการเผยแพร่เนื้อหา จากนั้นกดยืนยัน</li>
                <li>ตรวจเช็กสถานะการ์ดเพจในหน้าเว็บให้ขึ้นสัญลักษณ์สีเขียว <strong className="text-emerald-600 dark:text-emerald-400">"Active"</strong></li>
              </ol>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="size-4 text-indigo-600 dark:text-indigo-400" />
                การตั้งค่าคีย์ปัญญาประดิษฐ์ (AI API Keys) ในหน้า Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🤖 Google Gemini (แนะนำสูงสุด)
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    ใช้คีย์เดียวจาก Google AI Studio สามารถปลดล็อกได้ครบ 3 โมดูล: Gemini 2.5 Flash สำหรับเขียนสคริปต์, Imagen 4.0 Fast สำหรับวาดรูป, และ Google Veo 2.0 สำหรับสร้างคลิปวิดีโอ
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🎬 Kling AI Video (คีย์คู่)
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    จำเป็นต้องระบุคีย์ในรูปแบบ <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-mono">AccessKey:SecretKey</code> (คั่นด้วยโคลอน เช่น ak_xxx:sk_xxx) ระบบหลังบ้านจะสร้าง JWT Token ให้อัตโนมัติ
                  </p>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Section 3: AI Studio */}
        {(activeTab === "all" || activeTab === "studio") && (
          <article className="bg-white dark:bg-[#181d27] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  การสร้างสรรค์เนื้อหาใน AI Studio (`/dashboard/ai-studio`)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ห้องปฏิบัติการสร้างแคปชัน 3 สไตล์, ภาพประกอบ และวิดีโอเคลื่อนไหว
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ขั้นตอนการปฏิบัติงานใน AI Studio:
              </h3>
              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-white/5">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">ขั้นตอนที่ 1:</span>
                  <div>
                    พิมพ์หัวข้อสั้น ๆ เช่น <em>"แนะนำฟีเจอร์ใหม่ VibePost ระบบ Auto-Post โซเชียลมีเดียด้วย AI ช่วยประหยัดเวลา 80%"</em> แล้วคลิกปุ่ม <strong className="text-slate-900 dark:text-white">"✨ สร้างเนื้อหา 3 สไตล์"</strong>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-white/5">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">ขั้นตอนที่ 2:</span>
                  <div>
                    คลิกสลับแท็บเพื่อตรวจสอบแคปชัน:
                    <ul className="list-disc list-inside mt-1 space-y-1 text-slate-500 dark:text-slate-400">
                      <li><strong>Long-form:</strong> เหมาะสำหรับบทความให้ความรู้ รายละเอียดยาว</li>
                      <li><strong>Social Caption:</strong> เหมาะกับ Facebook & IG อ่านง่าย กระชับ มีอีโมจิ</li>
                      <li><strong>Marketing AIDA:</strong> โครงสร้างเพื่อการขาย (ดึงดูด ➔ สนใจ ➔ อยากได้ ➔ สั่งซื้อ)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-white/5">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">ขั้นตอนที่ 3:</span>
                  <div>
                    เลื่อนลงมาที่ส่วน <strong className="text-slate-900 dark:text-white">สร้างรูปภาพ (AI Visual)</strong> หรือ <strong className="text-slate-900 dark:text-white">สร้างวิดีโอ (Video Studio)</strong> คลิกปุ่ม <em>"ดึงบรีฟจากแคปชัน"</em> แล้วกดสั่งสร้าง ระบบจะดึง Imagen 4.0 Fast หรือ Google Veo / Luma มาสร้างสื่อทันที
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Section 4: 3 Action Routes */}
        {(activeTab === "all" || activeTab === "routes") && (
          <article className="bg-white dark:bg-[#181d27] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  3 เส้นทางในการเผยแพร่คอนเทนต์ (Action Routes)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  เลือกวิธีการส่งออกตามเป้าหมายของแคมเปญ
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Route A */}
              <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                  ⚡ Route A (ด่วนที่สุด)
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  🚀 เผยแพร่ทันที / ตั้งเวลา Auto-Post
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  คลิกเดียวเปิดหน้าต่างพรีวิวฟีดจำลอง ติ๊กเลือกเพจ Facebook/IG แล้วเลือก "โพสต์ทันที" หรือ "ตั้งเวลา" เข้าคิว Auto-Publisher ทันที
                </p>
                <div className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                  ✓ เหมาะสำหรับ: โพสต์ประจำวัน, ข่าวด่วน
                </div>
              </div>

              {/* Route B */}
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  💾 Route B (สายตุนสต็อก)
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  บันทึกเป็นแบบร่าง (Save Draft)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  เก็บเข้าคลังแบบร่างรอโพสต์ (Drafts Queue) โดยยังไม่ต้องระบุวันเวลา ช่วยให้ครีเอเตอร์ทำคอนเทนต์ตุนไว้ 10-30 ชิ้นในวันเดียว
                </p>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  ✓ เหมาะสำหรับ: Batch Content Production
                </div>
              </div>

              {/* Route C */}
              <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                  ⚙️ Route C (ละเอียดสูงสุด)
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  เปิดใน AI Publisher (ขั้นสูง)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  ส่งต่อเนื้อหาด้วย Session Bridge ไปยัง 4-Step Wizard เพื่อปรับข้อความแยกตามเพจ และตรวจสอบพรีวิวแยกอุปกรณ์
                </p>
                <div className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold">
                  ✓ เหมาะสำหรับ: แคมเปญการตลาดขนาดใหญ่
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Section 5: Drafts Queue */}
        {(activeTab === "all" || activeTab === "drafts") && (
          <article className="bg-white dark:bg-[#181d27] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  การบริหารจัดการคลังแบบร่างรอโพสต์ (Drafts Queue)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ศูนย์รวมคอนเทนต์ที่เตรียมไว้ในหน้า `/dashboard/history`
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              เมื่อเข้าไปที่เมนู <strong className="text-slate-900 dark:text-white">Post History</strong> และเลือกแท็บ <strong className="text-indigo-600 dark:text-indigo-400">"📝 คลังแบบร่างรอโพสต์ (Drafts Queue)"</strong> ท่านจะพบกับการ์ดคอนเทนต์ที่สร้างตุนไว้:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">🚀 ปุ่ม [ ตั้งค่า & สั่งโพสต์ ]</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">ดึงแคปชันและสื่อเปิด Modal ทันที เลือกเพจและวันเวลา แล้วส่งเข้าคิว Auto-Post ได้เลย</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
                  1-Click Action
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">✏️ ปุ่ม [ แก้ไข ]</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">เปิดกลับเข้าไปยังตัวปรับแต่ง เพื่อแก้ไขคำหรือปรับเปลี่ยนรูปภาพ</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  Edit
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">🗑️ ปุ่ม [ ลบ ]</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">ย้ายแบบร่างที่ไม่ใช้งานลงถังขยะ สามารถกู้คืนได้ที่หน้า Trash</p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold border border-red-200 dark:border-red-900">
                  Soft Delete
                </span>
              </div>
            </div>
          </article>
        )}

        {/* Section 6: Monitor & Analytics */}
        {(activeTab === "all" || activeTab === "monitor") && (
          <article className="bg-white dark:bg-[#181d27] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                6
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  การติดตามผลและตรวจสอบค่าใช้จ่าย (Monitor & Analytics)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  วงจรอายุโพสต์และสรุปการใช้เหรียญ Token
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="size-4 text-indigo-600 dark:text-indigo-400" />
                  สถานะของโพสต์ (Post Lifecycle)
                </div>
                <ul className="text-[11px] space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li><span className="font-bold text-amber-600">🟡 SCHEDULED:</span> อยู่ในคิวรอ Cron ดึงไปเผยแพร่</li>
                  <li><span className="font-bold text-blue-600">🔵 PUBLISHING:</span> กำลังนำส่งข้อมูลไปยัง Graph API</li>
                  <li><span className="font-bold text-emerald-600">🟢 PUBLISHED:</span> โพสต์สำเร็จขึ้นสู่ฟีดเรียบร้อย</li>
                  <li><span className="font-bold text-red-600">🔴 FAILED:</span> การส่งไม่สำเร็จ พร้อม Error Message</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Coins className="size-4 text-indigo-600 dark:text-indigo-400" />
                  สรุปค่าใช้จ่าย AI (AI Usage Summary)
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  ในหน้า Post History จะมีแดชบอร์ดสรุปจำนวน Tokens รวมที่ใช้ พร้อมประเมินค่าใช้จ่ายหน่วย USD และคำนวณเป็นเงินบาทไทย (THB) แบบเรียลไทม์ ช่วยให้องค์กรตรวจสอบความคุ้มค่าได้อย่างโปร่งใส
                </p>
              </div>
            </div>
          </article>
        )}

        {/* Section 7: Troubleshooting */}
        {(activeTab === "all" || activeTab === "troubleshoot") && (
          <article className="bg-white dark:bg-[#181d27] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                7
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  การแก้ไขปัญหาเบื้องต้น (Troubleshooting Guide)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  คู่มือแก้ไขปัญหาเมื่อการทำงานขัดข้อง
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 px-3 font-bold">ปัญหาที่พบ</th>
                    <th className="py-2.5 px-3 font-bold">สาเหตุที่เป็นไปได้</th>
                    <th className="py-2.5 px-3 font-bold">แนวทางแก้ไข</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">สั่งสร้างภาพหรือคลิปวิดีโอแล้วหมุนค้าง</td>
                    <td className="py-3 px-3">คีย์ API ไม่ถูกต้อง วงเงินหมด หรือเครือข่าย AI มีปัญหา</td>
                    <td className="py-3 px-3">ไปที่หน้า Settings ตรวจเช็ก Badge และทดสอบอัปเดตคีย์ใหม่</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">ภาพที่ได้เป็นภาพสต็อกทั่วไป</td>
                    <td className="py-3 px-3">เป็นระบบ Fallback ทำงานเมื่อระบบฟรีชนลิมิต IP</td>
                    <td className="py-3 px-3">แนะนำให้ระบุคีย์ Google Gemini ใน Settings เพื่อให้ได้ภาพ AI แท้เสมอ</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">โพสต์ขึ้นสถานะ FAILED</td>
                    <td className="py-3 px-3">Token การเชื่อมต่อเพจ Facebook/Instagram หมดอายุ</td>
                    <td className="py-3 px-3">ไปที่หน้า Integrations แล้วกด Reconnect เพจเพื่อต่ออายุ Token</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        )}

        {/* Section 8: Google Docs Guide */}
        {(activeTab === "all" || activeTab === "googledocs") && (
          <article className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 dark:from-[#1b2234] dark:via-[#181d27] dark:to-[#182333] border border-indigo-200/80 dark:border-indigo-800/60 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-3 border-b border-indigo-100 dark:border-white/5 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                8
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                  คู่มือการนำเข้าเอกสารสู่ Google Docs (Google Docs Guide)
                </h2>
                <p className="text-xs text-indigo-700 dark:text-indigo-400">
                  2 วิธีในการนำคู่มือนี้ไปเปิดและแก้ไขบน Google Docs ได้สมบูรณ์ 100%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Method 1 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-150 dark:border-white/10 space-y-3 shadow-2xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                  วิธีที่ 1: อัปโหลดไฟล์ .docx (แนะนำ สวยงาม 100%)
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                  <li>คลิกปุ่ม <strong className="text-indigo-600 dark:text-indigo-400">"ดาวน์โหลดไฟล์ Word (.docx)"</strong> ที่แถบเครื่องมือด้านบน</li>
                  <li>เปิดเว็บไซต์ <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">Google Drive</a></li>
                  <li>ลากไฟล์ <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">VibePost_Training_Manual.docx</code> ไปวางในไดรฟ์</li>
                  <li>ดับเบิลคลิกไฟล์ และเลือก <strong className="text-slate-900 dark:text-white">"เปิดด้วย Google เอกสาร (Open with Google Docs)"</strong></li>
                  <li>เอกสารจะแปลงเป็น Google Doc สมบูรณ์แบบ พร้อมตาราง หัวข้อ และฟอนต์ที่จัดไว้อย่างเป็นระเบียบ</li>
                </ol>
                <div className="pt-2">
                  <a
                    href="/downloads/VibePost_Training_Manual.docx"
                    download="VibePost_Training_Manual.docx"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Download className="size-3.5" />
                    ดาวน์โหลดไฟล์ .docx ทันที
                  </a>
                </div>
              </div>

              {/* Method 2 */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-150 dark:border-white/10 space-y-3 shadow-2xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                  วิธีที่ 2: ใช้ปุ่มคัดลอกด่วน (1-Click Copy)
                </div>
                <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                  <li>คลิกปุ่ม <strong className="text-slate-900 dark:text-white">"📋 คัดลอกเนื้อหา"</strong> ที่แถบด้านบนของหน้านี้</li>
                  <li>เปิดแท็บใหม่ไปที่ <a href="https://docs.new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">docs.new</a> เพื่อสร้างเอกสารเปล่าทันที</li>
                  <li>กดแป้นพิมพ์ <strong className="text-slate-900 dark:text-white">Ctrl + V</strong> (หรือ Cmd + V บน Mac) เพื่อวางเนื้อหา</li>
                  <li>เนื้อหาทั้งหมดจะถูกนำไปจัดวางใน Google Doc พร้อมแก้ไขและแชร์กับทีมงานได้ทันที</li>
                </ol>
                <div className="pt-2">
                  <a
                    href="https://docs.new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                  >
                    <ExternalLink className="size-3.5" />
                    เปิด docs.new ในแท็บใหม่
                  </a>
                </div>
              </div>
            </div>
          </article>
        )}

      </div>
    </div>
  );
}
