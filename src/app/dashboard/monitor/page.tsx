import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { MonitorTimeline } from "./MonitorTimeline";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Post Monitor | Vibe Post",
  description: "ตารางเวลาและสถานะการโพสต์อัตโนมัติของระบบ Vibe Post",
};

export default async function MonitorPage() {
  const workspace = await getActiveWorkspaceContext();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-12">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-emerald-600 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M17 14h-6" />
              <path d="M13 18H7" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Post Monitor</h1>
            <p className="text-slate-500 text-sm">
              ตารางปฏิทินแสดงคิวงานโพสต์อัตโนมัติ{workspace ? ` · ${workspace.name}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <MonitorTimeline />
    </div>
  );
}
