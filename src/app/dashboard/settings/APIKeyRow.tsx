"use client";

import React, { useState, useTransition } from "react";
import { saveAIProviderKey, deleteAIProviderKey } from "@/lib/actions/settings";
import type { AIProvider } from "@prisma/client";
import { CheckCircle2, Key, Loader2, Save, ShieldAlert, Trash2 } from "lucide-react";

type APIKeyRowProps = {
  providerId: AIProvider;
  name: string;
  description: string;
  isConfigured: boolean;
  isReadOnly?: boolean;
};

const MASK_DOTS = "••••••••••••••••••••••••••••••••";

export function APIKeyRow({
  providerId,
  name,
  description,
  isConfigured,
  isReadOnly = false,
}: APIKeyRowProps) {
  const [apiKey, setApiKey] = useState(isConfigured ? MASK_DOTS : "");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleFocus = () => {
    if (isConfigured && apiKey === MASK_DOTS) {
      setApiKey("");
    }
  };

  const handleBlur = () => {
    if (isConfigured && apiKey.trim() === "") {
      setApiKey(MASK_DOTS);
    }
  };

  const handleCopyCut = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || apiKey === MASK_DOTS) {
      setError("กรุณาใส่ API Key ที่ถูกต้อง");
      return;
    }

    setError("");
    setSuccess(false);

    startTransition(async () => {
      const res = await saveAIProviderKey(providerId, apiKey);
      if (res.success) {
        setSuccess(true);
        setApiKey(MASK_DOTS);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm(`คุณต้องการลบ API Key ของ ${name} ใช่หรือไม่?`)) return;
    setError("");
    setSuccess(false);
    setIsDeleting(true);
    const res = await deleteAIProviderKey(providerId);
    setIsDeleting(false);

    if (res.success) {
      setApiKey("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || "เกิดข้อผิดพลาดในการลบ");
    }
  };

  const hasNewValue = apiKey !== "" && apiKey !== MASK_DOTS;

  return (
    <div
      className={`neu-pressed rounded-2xl border transition-all duration-200 p-4 sm:p-5 ${
        isConfigured
          ? "border-emerald-500/35 hover:border-emerald-400/50"
          : "border-[var(--border)] hover:border-primary/35"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Key
                className={`size-4 ${
                  isConfigured ? "text-emerald-400" : "text-muted-foreground"
                }`}
              />
              {name}
            </h3>

            {isConfigured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <CheckCircle2 className="size-3" />
                เชื่อมต่อแล้ว
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>

        <div className="flex-1 w-full md:max-w-md">
          <form onSubmit={handleSave} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onCopy={handleCopyCut}
                  onCut={handleCopyCut}
                  placeholder={isConfigured ? "บันทึกคีย์ความปลอดภัยสูงแล้ว" : "ใส่ API Key..."}
                  disabled={isPending || isDeleting || isReadOnly}
                  className={`w-full rounded-xl px-3.5 py-2 text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 select-none font-mono bg-[var(--surface-elevated)] border ${
                    isConfigured
                      ? "border-emerald-500/35 text-emerald-500 dark:text-emerald-300 focus:ring-emerald-500/25"
                      : "border-[var(--border-control)] text-foreground placeholder:text-muted-foreground focus:ring-primary/30 focus:border-primary"
                  }`}
                />

                {isConfigured && apiKey === MASK_DOTS && (
                  <span className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md pointer-events-none">
                    🔒 Protected
                  </span>
                )}
              </div>

              <div className="flex gap-1.5">
                {isReadOnly ? (
                  <span className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] text-muted-foreground font-semibold bg-muted">
                    🔒 Read Only
                  </span>
                ) : (
                  <>
                    {isConfigured && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isPending || isDeleting}
                        title="ลบ API Key"
                        className="p-2.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/15 transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
                      >
                        {isDeleting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isPending || isDeleting || (!hasNewValue && isConfigured)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-w-[78px] disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
                        isConfigured
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm hover:brightness-110"
                          : "neu-tint-primary hover:brightness-110"
                      }`}
                    >
                      {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="size-3.5" />
                          {isConfigured ? "Update" : "Save"}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {success && (
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                บันทึกการตั้งค่าเรียบร้อยแล้ว!
              </p>
            )}

            {error && (
              <p className="text-xs font-bold text-destructive flex items-center gap-1.5">
                <ShieldAlert className="size-3.5" />
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
