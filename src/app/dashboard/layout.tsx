import React from "react";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen w-full selection:bg-amber-500/30 overflow-hidden text-zinc-100">
      <Sidebar session={session} />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
