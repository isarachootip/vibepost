import {
  getActiveWorkspaceContext,
  createDefaultWorkspace,
} from "@/lib/actions/workspace";
import { CreateWorkspaceButton } from "@/components/CreateWorkspaceButton";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { AlertTriangle, Info, UserPlus, X } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WorkspaceMembersPage() {
  try {
    const session = await auth();
    let userId = session?.user?.id || "";

    if (!userId && session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      if (dbUser) userId = dbUser.id;
    }

    const workspace = await getActiveWorkspaceContext();

    if (!workspace) {
      const createAction = createDefaultWorkspace.bind(null, userId);

      return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
          <div className="neu-raised size-16 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="size-8 text-amber-400" />
          </div>
          <h2 className="font-display text-2xl text-foreground mb-2">
            No Workspace Found
          </h2>
          <p className="text-muted-foreground max-w-sm mb-6 text-sm">
            System requires an active workspace node to function. Initialize a new
            workspace or contact support.
          </p>
          <form action={createAction}>
            <CreateWorkspaceButton />
          </form>
        </div>
      );
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-foreground mb-1">
              พื้นที่ทำงานและทีม
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              จัดการสิทธิ์การเข้าถึงและการตั้งค่าสำหรับ{" "}
              <span className="text-primary-ink font-bold">{workspace.name}</span>
            </p>
          </div>
          <button
            type="button"
            className="neu-tint-primary px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all hover:brightness-110 flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="size-4" />
            เชิญสมาชิก
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="neu-raised neu-mesh-card neu-grain rounded-3xl border border-[var(--border)] p-6 sm:p-7 h-max">
            <h3 className="font-display text-lg text-foreground mb-5">
              รายละเอียดพื้นที่ทำงาน
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  ชื่อพื้นที่ทำงาน
                </label>
                <div className="neu-pressed mt-1.5 text-sm sm:text-base font-bold text-foreground border border-[var(--border)] rounded-xl px-4 py-3">
                  {workspace.name}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                  รหัสพื้นที่ทำงาน
                </label>
                <div className="neu-pressed mt-1.5 text-xs text-muted-foreground border border-[var(--border)] rounded-xl px-4 py-3 font-mono break-all">
                  {workspace.id}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <button
                type="button"
                className="w-full text-center text-xs font-bold text-destructive hover:bg-destructive/15 transition-colors py-2.5 rounded-xl cursor-pointer"
              >
                Delete Workspace
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 neu-raised neu-grain rounded-3xl border border-[var(--border)] p-6 sm:p-7 space-y-5">
            <h3 className="font-display text-lg text-foreground">
              สมาชิกในทีม ({members.length})
            </h3>

            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="neu-pressed flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[var(--border)] hover:border-primary/35 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="neu-tint-primary size-11 rounded-2xl flex items-center justify-center font-display text-base shrink-0">
                      {member.user.name
                        ? member.user.name.charAt(0).toUpperCase()
                        : member.user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">
                        {member.user.name || "ผู้ใช้ไม่มีชื่อ"}
                        {member.userId === workspace.ownerId && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30 uppercase">
                            เจ้าของ
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-0 flex items-center gap-2.5">
                    <span className="neu-flat px-3 py-1 rounded-lg border border-[var(--border)] text-[11px] font-bold text-foreground">
                      {member.user.role}
                    </span>

                    {member.userId !== workspace.ownerId && (
                      <button
                        type="button"
                        className="size-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/15 transition-colors cursor-pointer"
                        title="ลบสมาชิก"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <div className="neu-pressed flex items-center gap-3 p-4 rounded-2xl border border-primary/25 text-primary-ink">
                <Info className="size-5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  ระดับสิทธิ์การเข้าถึงแบบละเอียดจะเปิดให้ใช้งานในเฟสที่ 2
                  ปัจจุบันสมาชิกในทีมทุกคนจะได้รับสิทธิ์ CREATOR เป็นค่าเริ่มต้น
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center h-[60vh]">
        <h1 className="text-destructive font-display text-2xl mb-4">
          Server Error Debug
        </h1>
        <pre className="text-left bg-[var(--surface)] border border-destructive/30 p-6 rounded-2xl text-xs text-destructive whitespace-pre-wrap max-w-4xl overflow-auto">
          {err.message}
        </pre>
      </div>
    );
  }
}
