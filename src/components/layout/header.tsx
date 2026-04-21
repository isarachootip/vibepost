import React from "react";

export function Header() {
  return (
    <header className="h-20 border-b border-white/[0.05] flex items-center justify-between px-8 shrink-0 bg-[#0F172A]/50 backdrop-blur-3xl relative z-20">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
      
      <div className="flex bg-white/5 rounded-full px-4 py-2 border border-white/10 items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></div>
        <h2 className="text-xs font-semibold text-slate-100 tracking-wide">Workspace Ready</h2>
      </div>
      
      {/* Action Header Elements */}
      <div className="flex gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.05] border border-white/10 hover:bg-blue-500/20 hover:border-blue-400/40 text-slate-300 hover:text-white transition-all shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_15px_rgba(59,130,246,0.3)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
      </div>
    </header>
  );
}
