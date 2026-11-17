"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWorkspaceVideoQuotaAction } from "@/lib/actions/settings";
import { Check, Film, Loader2 } from "lucide-react";

interface DailyVideoQuotaCardProps {
  initialQuota: number;
  usedToday: number;
  isReadOnly: boolean;
}

export function DailyVideoQuotaCard({
  initialQuota,
  usedToday,
  isReadOnly,
}: DailyVideoQuotaCardProps) {
  const [quota, setQuota] = useState(String(initialQuota));
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setSavedOk(false);
    setError("");
    try {
      const res = await updateWorkspaceVideoQuotaAction(quota);
      if (res.success && typeof res.dailyVideoQuota === "number") {
        setQuota(String(res.dailyVideoQuota));
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 2500);
      } else {
        setError(res.error || "บันทึกไม่สำเร็จ");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="neu-raised rounded-3xl border border-[var(--border)] p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base text-foreground flex items-center gap-2">
            <Film className="w-4 h-4 text-teal-500" />
            3. เพดานโควตาสร้างวิดีโอ Google Flow / Veo 3.1 รายวัน
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            จำกัดจำนวนคลิป AI สูงสุดต่อวันใน Workspace นี้ (รีเซ็ตอัตโนมัติเวลา 00:00 น. ตามเวลาไทย และไม่หักโควตาหาก API ขัดข้อง)
          </p>
        </div>

        <span className="neu-pressed px-3 py-1.5 rounded-xl text-xs font-bold border border-teal-500/30 text-teal-600 dark:text-teal-300">
          วันนี้ใช้ไป {usedToday} / {quota} คลิป
        </span>
      </div>

      {error && (
        <div className="p-3 bg-destructive/12 border border-destructive/30 text-destructive rounded-xl text-xs font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Input
            type="number"
            min={0}
            max={100}
            disabled={isReadOnly || saving}
            value={quota}
            onChange={(e) => setQuota(e.target.value)}
            className="h-11 rounded-xl font-bold text-sm"
          />
          <span className="text-xs font-bold text-muted-foreground shrink-0">
            คลิป / วัน
          </span>
        </div>

        {!isReadOnly && (
          <Button
            type="button"
            variant="tactile"
            disabled={saving}
            onClick={handleSave}
            className="h-11 px-5 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> กำลังบันทึก...
              </>
            ) : savedOk ? (
              <>
                <Check className="w-4 h-4" /> บันทึกโควตาแล้ว
              </>
            ) : (
              "บันทึกโควตา"
            )}
          </Button>
        )}
      </div>
    </section>
  );
}
