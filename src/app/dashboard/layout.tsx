import React from "react";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { SidebarWrapper } from "@/components/layout/sidebar-wrapper";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[var(--sheet)] text-foreground selection:bg-violet-500/25">
        <SidebarWrapper>
          <Sidebar session={session} />
        </SidebarWrapper>

        <main className="flex-1 flex flex-col min-w-0 relative bg-[var(--sheet)]">
          <Header />

          <div className="flex-1 overflow-auto p-3.5 sm:p-5 md:p-8 pb-24 md:pb-8 custom-scrollbar">
            {children}
          </div>

          <MobileBottomNav />
        </main>
      </div>
    </SidebarProvider>
  );
}
