import { getActiveWorkspaceContext, createDefaultWorkspace } from "@/lib/actions/workspace";
import { CreateWorkspaceButton } from "@/components/CreateWorkspaceButton";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function WorkspaceMembersPage() {
  try {
    const session = await auth();
    let userId = session?.user?.id || "";
    
    if (!userId && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (dbUser) userId = dbUser.id;
    }

    const workspace = await getActiveWorkspaceContext();

    if (!workspace) {
      const createAction = createDefaultWorkspace.bind(null, userId);

      return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
        <div className="w-16 h-16 bg-white border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-black/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Workspace Found</h2>
        <p className="text-slate-500 max-w-sm mb-6">System requires an active workspace node to function. Initialize a new matrix or contact support.</p>
        <form action={createAction}>
          <CreateWorkspaceButton />
        </form>
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
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2 font-heading tracking-tight drop-shadow-sm">
            พื้นที่ทำงานและทีม
          </h1>
          <p className="text-slate-600 font-medium tracking-wide">จัดการสิทธิ์การเข้าถึงและการตั้งค่าสำหรับ <span className="text-blue-600 font-bold">{workspace.name}</span></p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-slate-900 px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          เชิญสมาชิก
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Workspace Info Card */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8  shadow-xl shadow-black/20 h-max">
          <h3 className="text-xl font-bold text-slate-900 mb-6 drop-shadow-sm">รายละเอียดพื้นที่ทำงาน</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ชื่อพื้นที่ทำงาน</label>
              <div className="mt-1 text-lg font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl px-4 py-3">
                {workspace.name}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">รหัสพื้นที่ทำงาน</label>
              <div className="mt-1 text-sm font-code text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono">
                {workspace.id}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
             <button className="w-full text-center text-sm font-bold text-red-600 hover:text-red-300 transition-colors py-2 rounded-xl hover:bg-red-400/10">
               Delete Workspace
             </button>
          </div>
        </div>

        {/* Team Members List */}
        <div className="lg:col-span-2 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-black/20 relative overflow-hidden ">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <h3 className="text-xl font-bold text-slate-900 mb-6 drop-shadow-sm">สมาชิกในทีม ({members.length})</h3>
          
          <div className="space-y-4 relative z-10">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                    {member.user.name ? member.user.name.charAt(0).toUpperCase() : member.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                      {member.user.name || "ผู้ใช้ไม่มีชื่อ"}
                      {member.userId === workspace.ownerId && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30 uppercase">เจ้าของ</span>
                      )}
                    </h4>
                    <p className="text-sm text-slate-500">{member.user.email}</p>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600">
                    {member.user.role}
                  </div>
                  
                  {member.userId !== workspace.ownerId && (
                    <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-400/10 transition-colors" title="ลบสมาชิก">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
               <p className="text-sm">ระดับสิทธิ์การเข้าถึงแบบละเอียดจะเปิดให้ใช้งานในเฟสที่ 2 ปัจจุบันสมาชิกในทีมทุกคนจะได้รับสิทธิ์ CREATOR เป็นค่าเริ่มต้น</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
  } catch (error: any) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-red-600 font-bold text-2xl mb-4">Server Error Debug</h1>
        <pre className="text-left bg-black/50 border border-red-200 p-6 rounded-xl text-sm text-red-300 whitespace-pre-wrap max-w-4xl overflow-auto shadow-2xl">
          {error?.message || String(error)}
          {"\n\n"}
          {error?.stack}
        </pre>
      </div>
    )
  }
}
