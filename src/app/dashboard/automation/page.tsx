"use client";

import { useState, useEffect, useCallback } from "react";

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
  const [intervalMinutes, setIntervalMinutes] = useState(5);
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
      setIntervalMinutes(data.intervalMinutes ?? 5);
      setSelectedInterval(data.intervalMinutes ?? 5);
      setLogs(data.recentLogs ?? []);
    } catch {
      // use defaults
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
        setIntervalMinutes(selectedInterval);
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
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-xl font-medium text-white text-sm transition-all animate-in slide-in-from-top-2 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">⏰</span> Automation Settings
          </h1>
          <p className="text-slate-500 mt-1 text-sm">ตั้งค่าการโพสต์อัตโนมัติ — ระบบจะส่งโพสต์ที่ตั้งตารางไว้ไปยัง Facebook ตามเวลาที่กำหนด</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
          {isActive ? "กำลังทำงาน" : "ปิดอยู่"}
        </div>
      </div>

      {/* Main Config Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-700 mb-4">🔄 Auto-Publisher Cron Job</h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {INTERVALS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedInterval(opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedInterval === opt.value
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50"
              }`}
            >
              <div className={`text-2xl font-bold ${selectedInterval === opt.value ? "text-red-600" : "text-slate-700"}`}>
                {opt.value < 60 ? `${opt.value}m` : "1h"}
              </div>
              <div className={`text-xs mt-1 font-medium ${selectedInterval === opt.value ? "text-red-500" : "text-slate-500"}`}>
                {opt.label}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-700">Cron Expression: </span>
            <code className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono text-red-700">
              */{selectedInterval} * * * *
            </code>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            ระบบจะตรวจสอบโพสต์ที่รอ Publish ทุก {selectedInterval} นาที และส่งไปยัง Facebook โดยอัตโนมัติ
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><span>💾</span> บันทึก & เปิดใช้งาน</>
            )}
          </button>
          {isActive && (
            <button
              onClick={handleDisable}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-medium text-sm transition-all"
            >
              ปิด
            </button>
          )}
        </div>
      </div>

      {/* Manual Trigger Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-700 mb-2">⚡ รัน Publisher ทันที</h2>
        <p className="text-sm text-slate-500 mb-4">กดเพื่อสั่งให้ระบบส่งโพสต์ที่รออยู่ทั้งหมดทันที โดยไม่ต้องรอ Cron</p>
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {triggering ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> กำลังรัน...</>
          ) : (
            <><span>🚀</span> Publish Now</>
          )}
        </button>
      </div>

      {/* Logs Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-700">📋 Activity Log</h2>
          <button onClick={fetchStatus} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            🔄 Refresh
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-6 h-6 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            <p className="text-3xl mb-2">📭</p>
            <p>ยังไม่มี Log — จะปรากฏหลังจาก Cron ทำงานครั้งแรก</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto font-mono text-xs">
            {logs.map((log, i) => {
              const isSuccess = log.includes("Processed") && !log.includes("ERROR");
              const isError = log.includes("ERROR");
              return (
                <div key={i} className={`px-3 py-2 rounded-lg ${
                  isError ? "bg-red-50 text-red-700" :
                  isSuccess ? "bg-green-50 text-green-700" :
                  "bg-slate-50 text-slate-600"
                }`}>
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
