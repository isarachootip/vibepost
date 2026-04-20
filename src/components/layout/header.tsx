import React from "react";

export function Header() {
  return (
    <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 shrink-0 bg-white/[0.01] backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-zinc-400">Dashboard</h2>
      </div>
      
      {/* Action Header Elements */}
      <div className="flex gap-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-zinc-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        </button>
      </div>
    </header>
  );
}
