"use client";

import React from "react";
import { useSidebar } from "./sidebar-context";

export function Header() {
  const { isOpen, setIsOpen } = useSidebar();

  return (
    <header className="h-16 md:h-20 border-b border-slate-200 flex items-center justify-between px-3 md:px-8 shrink-0 bg-white shadow-xs relative z-20">
      
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700 focus:outline-none transition-colors"
          aria-label="Toggle Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>

        {/* Mobile Logo Brand */}
        <div className="flex md:hidden items-center gap-1.5 font-bold text-slate-900 text-sm">
          <div className="w-6 h-6 bg-red-600 rounded-md flex items-center justify-center text-white text-xs font-black shadow-xs">
            V
          </div>
          <span>VibePost</span>
        </div>

        <div className="hidden sm:flex bg-slate-100 rounded-full px-3.5 py-1.5 border border-slate-200 items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <h2 className="text-xs font-semibold text-slate-700 tracking-wide">Workspace Ready</h2>
        </div>
      </div>
      
      {/* Action Header Elements */}
      <div className="flex items-center gap-2">
        <div className="sm:hidden flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Ready
        </div>
        <button className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all shadow-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
      </div>
    </header>
  );
}

