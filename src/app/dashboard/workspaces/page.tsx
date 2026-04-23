import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function WorkspaceMembersPage() {
  const session = await auth();
  const workspace = await getActiveWorkspaceContext();

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <div className="w-16 h-16 bg-[#060a14] border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-black/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Workspace Found</h2>
        <p className="text-slate-400 max-w-sm mb-6">System requires an active workspace node to function. Initialize a new matrix or contact support.</p>
        <button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black px-8 py-3 rounded-full font-semibold transition-all shadow-[0_4px_15px_rgba(245,158,11,0.3)]">Create Workspace</button>
      </div>
    )
  }

  // Fetch full details of members
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    include: { user: true },
    orderBy: { joinedAt: "asc" }
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-heading tracking-tight drop-shadow-sm">
            Workspace & Team
          </h1>
          <p className="text-slate-300 font-medium tracking-wide">Manage access and settings for <span className="text-blue-400 font-bold">{workspace.name}</span></p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          Invite Member
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Workspace Info Card */}
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-xl shadow-black/20 h-max">
          <h3 className="text-xl font-bold text-white mb-6 drop-shadow-sm">Workspace Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace Name</label>
              <div className="mt-1 text-lg font-semibold text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                {workspace.name}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Workspace ID</label>
              <div className="mt-1 text-sm font-code text-slate-300 bg-black/20 border border-white/5 rounded-xl px-4 py-3 font-mono">
                {workspace.id}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
             <button className="w-full text-center text-sm font-bold text-red-400 hover:text-red-300 transition-colors py-2 rounded-xl hover:bg-red-400/10">
               Delete Workspace
             </button>
          </div>
        </div>

        {/* Team Members List */}
        <div className="lg:col-span-2 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-8 shadow-xl shadow-black/20 relative overflow-hidden backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <h3 className="text-xl font-bold text-white mb-6 drop-shadow-sm">Team Members ({members.length})</h3>
          
          <div className="space-y-4 relative z-10">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {member.user.name ? member.user.name.charAt(0).toUpperCase() : member.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white leading-tight">
                      {member.user.name || "Unnamed User"}
                      {member.userId === workspace.ownerId && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">Owner</span>
                      )}
                    </h4>
                    <p className="text-sm text-slate-400">{member.user.email}</p>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300">
                    {member.user.role}
                  </div>
                  
                  {member.userId !== workspace.ownerId && (
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Remove Member">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
               <p className="text-sm">Additional roles and permission levels will be active after phase 2 deployment. Currently all team members have CREATOR access by default.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
