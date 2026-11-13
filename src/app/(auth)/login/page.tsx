import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--sheet)] p-4 text-foreground">
      <div className="pointer-events-none fixed -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-32 -left-32 h-[380px] w-[380px] rounded-full bg-teal-500/15 blur-[120px]" />

      <div className="absolute top-4 right-4 left-4 z-20 flex items-center justify-between max-w-5xl mx-auto">
        <Link
          href="/"
          className="neu-raised inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-control)] px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all hover:-translate-y-0.5"
        >
          <ArrowLeft className="size-3.5" />
          <span>หน้าแรก</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="neu-lifted neu-mesh-card neu-grain relative z-10 w-full max-w-sm rounded-3xl border border-[var(--border-control)] p-7 sm:p-8">
        <div className="text-center mb-7">
          <div className="neu-tint-primary mx-auto mb-4 grid size-12 place-items-center rounded-2xl">
            <Sparkles className="size-6" />
          </div>
          <span className="neu-pressed inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-bold text-primary-ink border border-[var(--border)] mb-3">
            VibePost Omni-Studio
          </span>
          <h1 className="font-display text-2xl text-foreground mb-1.5">
            ยินดีต้อนรับกลับมา
          </h1>
          <p className="text-xs text-muted-foreground">
            เข้าสู่ระบบเพื่อจัดการคอนเทนต์และ AI Studio ของคุณ
          </p>
        </div>

        <form
          action={async (formData) => {
            "use server";
            await signIn("credentials", formData);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="w-full rounded-xl border border-[var(--border-control)] bg-[var(--surface-elevated)]/85 px-3.5 py-2.5 text-sm text-foreground shadow-[inset_2px_2px_5px_var(--neu-dark)] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground/90" htmlFor="password">
                Password
              </label>
              <span className="text-[11px] font-semibold text-primary-ink">
                Workspace Access
              </span>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-[var(--border-control)] bg-[var(--surface-elevated)]/85 px-3.5 py-2.5 text-sm text-foreground shadow-[inset_2px_2px_5px_var(--neu-dark)] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            type="submit"
            className="neu-tint-primary mt-2 w-full rounded-xl py-2.5 text-sm font-extrabold tracking-tight transition-all hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            Sign In to Studio
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--border)] text-center text-xs text-muted-foreground">
          ต้องการบัญชีใช้งาน?{" "}
          <span className="font-semibold text-primary-ink">ติดต่อ Workspace Admin</span>
        </div>
      </div>
    </div>
  );
}
