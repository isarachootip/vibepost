import React from "react";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
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
    <div className="flex h-screen w-full selection:bg-red-500/30 overflow-hidden text-slate-900 bg-slate-50">
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
