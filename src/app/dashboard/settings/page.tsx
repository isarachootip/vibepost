import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";

const AI_PROVIDERS = [
  { id: "OPENROUTER", name: "OpenRouter AI", description: "Access multiple models including Claude 3.5 and GPT-4o." },
  { id: "OPENAI", name: "OpenAI", description: "Direct API access to GPT models." },
  { id: "CLAUDE", name: "Anthropic Claude", description: "Direct API access to the Claude ecosystem." },
  { id: "GEMINI", name: "Google Gemini", description: "Direct API access to Gemini 1.5 Pro/Flash." }
];

export default async function SettingsPage() {
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return <div className="p-8 text-white">Please create a workspace first.</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out max-w-5xl mx-auto pb-12">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Workspace Settings</h1>
        <p className="text-zinc-400 text-sm">Configure how your content is generated using AI providers.</p>
      </header>

      <div className="rounded-3xl border border-white/10 bg-white/[0.01] p-6 md:p-8 backdrop-blur-xl">
        <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
          AI API Configuration
        </h2>
        
        <div className="space-y-6">
          {AI_PROVIDERS.map((provider) => {
            const config = workspace.promptConfigs.find(c => c.provider === provider.id);
            const isConfigured = !!config && config.isActive;

            return (
              <div key={provider.id} className="relative rounded-2xl border border-white/5 bg-black/40 p-5 group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white">{provider.name}</h3>
                      {isConfigured && (
                         <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">Active</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">{provider.description}</p>
                  </div>
                  
                  <div className="flex-1 w-full md:max-w-md">
                    <form className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="password" 
                          placeholder={isConfigured ? "Wait, API Key is already set (••••••••)" : "Enter API Key..."}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button type="submit" className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-white/10">
                        {isConfigured ? "Update" : "Save"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 md:p-8 backdrop-blur-xl mt-8">
         <h2 className="text-lg font-medium text-red-500 mb-2">Danger Zone</h2>
         <p className="text-sm text-red-400/70 mb-6">Irreversible actions for this workspace.</p>
         
         <div className="flex items-center justify-between p-4 rounded-2xl border border-red-500/10 bg-black/20">
            <div>
               <h4 className="text-white text-sm font-medium">Delete Workspace</h4>
               <p className="text-xs text-zinc-500 mt-1">Permanently remove this workspace and all its data.</p>
            </div>
            <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
               Delete Everything
            </button>
         </div>
      </div>
    </div>
  );
}
