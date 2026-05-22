import React from "react";

export function Header() {
  return (
    <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 shrink-0 bg-white shadow-sm relative z-20">
      
      <div className="flex bg-slate-100 rounded-full px-4 py-2 border border-slate-200 items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        <h2 className="text-xs font-semibold text-slate-700 tracking-wide">Workspace Ready</h2>
      </div>
      
      {/* Action Header Elements */}
      <div className="flex gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
      </div>
    </header>
  );
}
