"use client";

import { useCallback, useEffect, useState } from "react";

const INTERVALS = [
  { label: "ทุก 1 นาที", value: 1 },
  { label: "ทุก 5 นาที", value: 5 },
  { label: "ทุก 10 นาที", value: 10 },
  { label: "ทุก 15 นาที", value: 15 },
  { label: "ทุก 30 นาที", value: 30 },
  { label: "ทุก 1 ชั่วโมง", value: 60 },
];

export default function AutomationPage() {
  const [isActive, setIsActive] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState(5);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/automation");
      const data = await res.json();
      setIsActive(data.isActive ?? true);
      setSelectedInterval(data.intervalMinutes ?? 5);
      setLogs(data.recentLogs ?? []);
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", intervalMinutes: selectedInterval }),
      });
      const data = await res.json();
      if (data.success) {
        setIsActive(true);
        showToast(`✅ บันทึกแล้ว! จะ Publish ทุก ${selectedInterval} นาที`);
        fetchStatus();
      } else {
        showToast(data.error || "เกิดข้อผิดพลาด", "error");
      }
    } catch {
      showToast("ไม่สามารถบันทึกได้", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("🚀 รัน Publisher สำเร็จ!");
        setTimeout(fetchStatus, 1000);
      } else {
        showToast(data.error || "เกิดข้อผิดพลาด", "error");
      }
    } catch {
      showToast("ไม่สามารถรันได้", "error");
    } finally {
      setTriggering(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm("ต้องการปิด Auto-Publisher หรือไม่?")) return;
    try {
      const res = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      const data = await res.json();
      if (data.success) {
        setIsActive(false);
        showToast("ปิด Auto-Publisher แล้ว");
      }
    } catch {
      showToast("ไม่สามารถปิดได้", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-white text-xs sm:text-sm transition-all animate-in slide-in-from-top-2 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-destructive"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-foreground flex items-center gap-2">
            <span>⏰</span> Automation Settings
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
            ตั้งค่าการโพสต์อัตโนมัติ — ระบบจะส่งโพสต์ที่ตั้งตารางไว้ตามเวลาที่กำหนด
          </p>
        </div>
        <div
          className={`neu-pressed flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
            isActive
              ? "border-emerald-500/30 text-emerald-500 dark:text-emerald-400"
              : "border-[var(--border)] text-muted-foreground"
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
            }`}
          />
          {isActive ? "กำลังทำงาน" : "ปิดอยู่"}
        </div>
      </div>

      <div className="neu-raised neu-grain rounded-3xl border border-[var(--border)] p-6 space-y-5">
        <h2 className="font-display text-base text-foreground">
          🔄 Auto-Publisher Cron Job
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INTERVALS.map((opt) => {
            const active = selectedInterval === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedInterval(opt.value)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  active
                    ? "neu-pressed border-primary/50"
                    : "neu-flat border-[var(--border)] hover:border-primary/30"
                }`}
              >
                <div
                  className={`font-display text-2xl ${
                    active ? "text-primary-ink" : "text-foreground"
                  }`}
                >
                  {opt.value < 60 ? `${opt.value}m` : "1h"}
                </div>
                <div className="text-xs mt-1 font-semibold text-muted-foreground">
                  {opt.label}
                </div>
              </button>
            );
          })}
        </div>

        <div className="neu-pressed rounded-2xl p-4 border border-[var(--border)]">
          <p className="text-xs sm:text-sm text-foreground">
            <span className="font-bold">Cron Expression: </span>
            <code className="bg-primary/15 text-primary-ink px-2 py-0.5 rounded-md text-xs font-mono font-bold">
              */{selectedInterval} * * * *
            </code>
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            ระบบจะตรวจสอบโพสต์ที่รอ Publish ทุก {selectedInterval} นาที และส่งออกอัตโนมัติ
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="neu-tint-primary flex-1 font-bold py-3 px-6 rounded-xl text-sm transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? "กำลังบันทึก..." : "💾 บันทึก & เปิดใช้งาน"}
          </button>
          {isActive && (
            <button
              type="button"
              onClick={handleDisable}
              className="neu-raised px-5 py-3 rounded-xl border border-[var(--border-control)] text-muted-foreground hover:text-destructive hover:border-destructive/40 font-bold text-xs transition-all cursor-pointer"
            >
              ปิด
            </button>
          )}
        </div>
      </div>

      <div className="neu-raised rounded-3xl border border-[var(--border)] p-6">
        <h2 className="font-display text-base text-foreground mb-1.5">
          ⚡ รัน Publisher ทันที
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4">
          กดเพื่อสั่งให้ระบบส่งโพสต์ที่รออยู่ทั้งหมดทันที โดยไม่ต้องรอ Cron
        </p>
        <button
          type="button"
          onClick={handleTrigger}
          disabled={triggering}
          className="neu-tint-teal font-bold py-2.5 px-6 rounded-xl text-sm transition-all hover:brightness-110 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {triggering ? "กำลังรัน..." : "🚀 Publish Now"}
        </button>
      </div>

      <div className="neu-raised rounded-3xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-base text-foreground">📋 Activity Log</h2>
          <button
            type="button"
            onClick={fetchStatus}
            className="text-xs font-bold text-primary-ink hover:underline cursor-pointer"
          >
            🔄 Refresh
          </button>
        </div>
        {loading ? (
          <div className="neu-shimmer h-20 rounded-2xl" />
        ) : logs.length === 0 ? (
          <div className="neu-pressed text-center py-8 rounded-2xl border border-[var(--border)] text-muted-foreground text-xs">
            <p className="text-2xl mb-1.5">📭</p>
            <p>ยังไม่มี Log — จะปรากฏหลังจาก Cron ทำงานครั้งแรก</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar font-mono text-xs">
            {logs.map((log, i) => {
              const isSuccess = log.includes("Processed") && !log.includes("ERROR");
              const isError = log.includes("ERROR");
              return (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-xl border ${
                    isError
                      ? "bg-destructive/15 border-destructive/30 text-destructive"
                      : isSuccess
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500 dark:text-emerald-300"
                      : "neu-pressed border-[var(--border)] text-muted-foreground"
                  }`}
                >
                  {log}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
