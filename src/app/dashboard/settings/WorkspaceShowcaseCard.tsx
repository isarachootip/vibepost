"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateWorkspaceShowcaseAction } from "@/lib/actions/showcase.actions";
import { Eye, EyeOff, Globe, Loader2 } from "lucide-react";

interface WorkspaceShowcaseCardProps {
  workspaceId: string;
  workspaceName: string;
  initialShowOnLanding: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export function WorkspaceShowcaseCard({
  workspaceId,
  workspaceName,
  initialShowOnLanding,
  isAdmin,
  isSuperAdmin,
}: WorkspaceShowcaseCardProps) {
  const router = useRouter();
  const [showOnLanding, setShowOnLanding] = useState(initialShowOnLanding);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Workspace Admin can turn OFF for confidentiality; only Super Admin can turn back ON
  const canToggle =
    isSuperAdmin || (isAdmin && showOnLanding);

  const handleToggle = () => {
    const nextValue = !showOnLanding;
    setError("");
    startTransition(async () => {
      const res = await updateWorkspaceShowcaseAction({
        workspaceId,
        showOnLanding: nextValue,
      });
      if (res.success && typeof res.showOnLanding === "boolean") {
        setShowOnLanding(res.showOnLanding);
        router.refresh();
      } else {
        setError(res.error || "ไม่สามารถบันทึกการตั้งค่าได้");
      }
    });
  };

  return (
    <section className="neu-raised rounded-3xl border border-[var(--border)] p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <h2 className="font-display text-base text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            4. การแสดงผลงานบนหน้าแรกสาธารณะ (Public Landing Showcase)
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            กำหนดว่าอนุญาตให้โพสต์ที่เผยแพร่สำเร็จของแบรนด์{" "}
            <strong className="text-foreground">{workspaceName}</strong>{" "}
            แสดงในแกลเลอรีผลงานบนหน้าแรกของเว็บไซต์หรือไม่ (สามารถเลือกซ่อนเฉพาะบางโพสต์เพิ่มเติมได้ที่หน้า Post History)
          </p>
        </div>

        <Button
          type="button"
          variant={showOnLanding ? "tactile" : "neu"}
          disabled={!canToggle || isPending}
          onClick={handleToggle}
          className="h-11 px-5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : showOnLanding ? (
            <><Eye className="w-4 h-4" /> แสดงบนหน้าแรกอยู่ (คลิกเพื่อซ่อนทั้งแบรนด์)</>
          ) : (
            <><EyeOff className="w-4 h-4" /> ซ่อนทั้งแบรนด์อยู่ {isSuperAdmin ? "(คลิกเพื่อเปิดแสดง)" : ""}</>
          )}
        </Button>
      </div>

      {!showOnLanding && !isSuperAdmin && (
        <p className="text-[11px] text-amber-600 dark:text-amber-300 font-semibold">
          🔒 แบรนด์นี้ถูกปิดการแสดงผลบนหน้าแรกไว้ เฉพาะ Super Admin เท่านั้นที่สามารถเปิดแสดงกลับมาได้
        </p>
      )}

      {error && (
        <div className="p-3 bg-destructive/12 border border-destructive/30 text-destructive rounded-xl text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}
    </section>
  );
}
