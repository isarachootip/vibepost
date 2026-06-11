import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { APIKeyRow } from "./APIKeyRow";

const AI_PROVIDERS = [
  { id: "GEMINI", name: "Google Gemini", description: "Gemini 2.5 Flash / Pro — แนะนำสำหรับภาษาไทย", icon: "🤖", category: "text" },
  { id: "OPENAI", name: "OpenAI / ChatGPT", description: "GPT-4o, GPT-4 Turbo — ผลลัพธ์สูง", icon: "⚡", category: "text" },
  { id: "CLAUDE", name: "Anthropic Claude", description: "Claude 3.5 Sonnet — เขียนได้ดีมาก", icon: "🧠", category: "text" },
  { id: "OPENROUTER", name: "OpenRouter AI", description: "รวมหลาย model ผ่าน API เดียว", icon: "🔀", category: "text" },
  { id: "KIMI", name: "Moonshot / Kimi AI", description: "Kimi Moonshot-v1 — เขียนภาษาไทยและจีนยอดเยี่ยม", icon: "🌙", category: "text" },
  { id: "KLING", name: "Kling AI Video", description: "Kling API Key ในรูปแบบ AccessKey:SecretKey (เช่น AK_xxx:SK_xxx)", icon: "🎬", category: "media" },
  { id: "LUMA", name: "Luma Dream Machine", description: "Luma AI Dream Machine Video Bearer Token", icon: "🎥", category: "media" },
];

async function getUserWorkspaceRole(workspaceId: string) {
  const session = await auth();
  if (!session?.user?.email) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true, name: true },
  });
  if (!dbUser) return null;

  // Super Admin
  if (dbUser.role === "ADMIN") return { role: "ADMIN" as const, isSuper: true, name: dbUser.name };

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: dbUser.id, workspaceId } },
    select: { role: true },
  });

  return { role: member?.role ?? "MEMBER", isSuper: false, name: dbUser.name };
}

export default async function SettingsPage() {
  const workspace = await getActiveWorkspaceContext();
  if (!workspace) {
    return <div className="p-8 text-slate-900">Please create a workspace first.</div>;
  }

  const userInfo = await getUserWorkspaceRole(workspace.id);
  const isAdmin = userInfo?.role === "ADMIN";

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700 border-red-200",
    MEMBER: "bg-blue-100 text-blue-700 border-blue-200",
    VIEWER: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const roleLabels: Record<string, string> = {
    ADMIN: userInfo?.isSuper ? "⭐ Super Admin" : "🔑 Workspace Admin",
    MEMBER: "👤 Member",
    VIEWER: "👁️ Viewer",
  };

  const configs = workspace.promptConfigs || [];
  
  // Calculate current workspace engine status
  const activeTextProvider = AI_PROVIDERS.find(p => p.category === "text" && configs.some(c => c.provider === p.id && c.isActive));
  const activeVideoProvider = AI_PROVIDERS.find(p => p.category === "media" && configs.some(c => c.provider === p.id && c.isActive));
  
  const hasGeminiKey = configs.some(c => c.provider === "GEMINI" && c.isActive);
  const hasOpenAIKey = configs.some(c => c.provider === "OPENAI" && c.isActive);
  const activeImageEngine = hasGeminiKey 
    ? "Google Imagen 4.0 Fast (Auto-upgrade)"
    : hasOpenAIKey
    ? "OpenAI DALL-E 3 (Auto-upgrade)"
    : "Free Stable Diffusion (Default)";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto pb-12">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">⚙️ Settings — {workspace.name}</h1>
          <p className="text-slate-500 text-sm">ตั้งค่า AI Provider และเครื่องมือสำหรับ Workspace นี้</p>
        </div>
        {userInfo && (
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${roleColors[userInfo.role as string] || roleColors.MEMBER}`}>
            {roleLabels[userInfo.role as string] || "👤 Member"}
          </span>
        )}
      </header>

      {/* Non-admin warning */}
      {!isAdmin && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <span className="text-xl">🔒</span>
          <div>
            <p className="font-semibold">สิทธิ์อ่านอย่างเดียว</p>
            <p className="text-amber-700 text-xs mt-0.5">เฉพาะ Workspace Admin เท่านั้นที่สามารถแก้ไข API Key ได้ กรุณาติดต่อ Admin ของ Workspace นี้</p>
          </div>
        </div>
      )}

      {/* 🚀 Workspace Configuration Summary Card */}
      <div className="rounded-2xl border border-indigo-150 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>✨</span> Workspace Configuration Summary
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">สรุปสถานะการประมวลผลของสมองกล AI ในพื้นที่ทำงานนี้</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">✍️ การเขียนบทความ (Text)</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-md inline-block ${activeTextProvider ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-slate-100 text-slate-500"}`}>
              {activeTextProvider ? `${activeTextProvider.icon} ${activeTextProvider.name}` : "⚠️ ยังไม่ได้ตั้งค่า (Not Configured)"}
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🎨 การสร้างรูปภาพ (Image)</span>
            <span className="text-xs font-black px-2 py-0.5 rounded-md inline-block bg-purple-50 text-purple-700 border border-purple-100">
              🖼️ {activeImageEngine}
            </span>
          </div>

          <div className="p-4 bg-white border border-slate-100 rounded-xl space-y-1.5 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">🎬 การสร้างวิดีโอ (Video)</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-md inline-block ${activeVideoProvider ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-slate-100 text-slate-500"}`}>
              {activeVideoProvider ? `${activeVideoProvider.icon} ${activeVideoProvider.name}` : "📼 Curated Stock Video (Pexels)"}
            </span>
          </div>
        </div>
      </div>

      {/* Group 1: Text Content Config */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>✍️</span> 1. เครื่องมือเขียนบทความ (Text Content Generators)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">กำหนดค่าคีย์ API สำหรับการสร้างสรรค์ข้อความ แคปชัน และแคมเปญโฆษณา</p>
        </div>

        <div className="space-y-4">
          {AI_PROVIDERS.filter(p => p.category === "text").map((provider) => {
            const config = configs.find(c => c.provider === provider.id);
            const isConfigured = !!config && config.isActive;

            return (
              <APIKeyRow
                key={provider.id}
                providerId={provider.id as any}
                name={`${provider.icon} ${provider.name}`}
                description={provider.description}
                isConfigured={isConfigured}
                isReadOnly={!isAdmin}
              />
            );
          })}
        </div>
      </div>

      {/* Group 2: Media Config */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>🎬</span> 2. เครื่องมือสร้างวิดีโอสตูดิโอ (Visuals & Video Generators)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">กำหนดค่าคีย์ API สำหรับการเจเนอเรตวิดีโอแบบ AI Text-to-Video อัจฉริยะ</p>
        </div>

        <div className="space-y-4">
          {AI_PROVIDERS.filter(p => p.category === "media").map((provider) => {
            const config = configs.find(c => c.provider === provider.id);
            const isConfigured = !!config && config.isActive;

            return (
              <APIKeyRow
                key={provider.id}
                providerId={provider.id as any}
                name={`${provider.icon} ${provider.name}`}
                description={provider.description}
                isConfigured={isConfigured}
                isReadOnly={!isAdmin}
              />
            );
          })}
        </div>

        <p className="text-xs text-slate-400 mt-5 border-t border-slate-100 pt-4">
          🔐 API Key ถูกเข้ารหัสและใช้เฉพาะกับ Workspace <strong>{workspace.name}</strong> เท่านั้น — Workspace อื่นไม่สามารถเข้าถึงได้
        </p>
      </div>

      {/* Danger Zone — Admin only */}
      {isAdmin && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
          <h2 className="text-base font-bold text-red-600 mb-1">⚠️ Danger Zone</h2>
          <p className="text-sm text-red-500/80 mb-4">การกระทำที่ไม่สามารถย้อนกลับได้</p>

          <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-white">
            <div>
              <h4 className="text-slate-900 text-sm font-semibold">ลบ Workspace</h4>
              <p className="text-xs text-slate-500 mt-0.5">ลบ Workspace นี้และข้อมูลทั้งหมดอย่างถาวร</p>
            </div>
            <button className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Delete Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
