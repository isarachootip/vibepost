import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { APIKeyRow } from "./APIKeyRow";

const AI_PROVIDERS = [
  { id: "OPENROUTER", name: "OpenRouter AI", description: "Access multiple models including Claude 3.5 and GPT-4o." },
  { id: "OPENAI", name: "OpenAI", description: "Direct API access to GPT models." },
  { id: "CLAUDE", name: "Anthropic Claude", description: "Direct API access to the Claude ecosystem." },
  { id: "GEMINI", name: "Google Gemini", description: "Direct API access to Gemini 1.5 Pro/Flash." }
];

export default async function SettingsPage() {
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return <div className="p-8 text-slate-900">Please create a workspace first.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out max-w-5xl mx-auto pb-12">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">การตั้งค่าพื้นที่ทำงาน</h1>
        <p className="text-slate-500 text-sm">ตั้งค่าผู้ให้บริการ AI ที่ใช้ในการสร้างคอนเทนต์</p>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 ">
        <h2 className="text-lg font-medium text-slate-900 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
          การตั้งค่า AI API
        </h2>
        
        <div className="space-y-6">
          {AI_PROVIDERS.map((provider) => {
            const config = workspace.promptConfigs.find(c => c.provider === provider.id);
            const isConfigured = !!config && config.isActive;

            return (
              <APIKeyRow 
                key={provider.id}
                providerId={provider.id as any}
                name={provider.name}
                description={provider.description}
                isConfigured={isConfigured}
              />
            );
          })}
        </div>
      </div>
      
      {/* พื้นที่อันตราย */}
      <div className="rounded-3xl border border-red-200 bg-red-500/5 p-6 md:p-8  mt-8">
         <h2 className="text-lg font-medium text-red-600 mb-2">พื้นที่อันตราย</h2>
         <p className="text-sm text-red-600/70 mb-6">การกระทำที่ไม่สามารถย้อนกลับได้สำหรับพื้นที่ทำงานนี้</p>
         
         <div className="flex items-center justify-between p-4 rounded-2xl border border-red-200 bg-slate-50">
            <div>
               <h4 className="text-slate-900 text-sm font-medium">ลบพื้นที่ทำงาน</h4>
               <p className="text-xs text-slate-500 mt-1">ลบพื้นที่ทำงานนี้และข้อมูลทั้งหมดอย่างถาวร</p>
            </div>
            <button className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
               Delete Everything
            </button>
         </div>
      </div>
    </div>
  );
}
