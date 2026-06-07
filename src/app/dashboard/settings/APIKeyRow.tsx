"use client";

import React, { useState, useTransition } from "react";
import { saveAIProviderKey, deleteAIProviderKey } from "@/lib/actions/settings";
import { AIProvider } from "@prisma/client";
import { CheckCircle2, ShieldAlert, Loader2, Trash2, Save, Key } from "lucide-react";

type APIKeyRowProps = {
  providerId: AIProvider;
  name: string;
  description: string;
  isConfigured: boolean;
  isReadOnly?: boolean;
};

export function APIKeyRow({ providerId, name, description, isConfigured, isReadOnly = false }: APIKeyRowProps) {
  const [apiKey, setApiKey] = useState(isConfigured ? "••••••••••••••••••••••••••••••••" : "");
  const [isFocused, setIsFocused] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  // Detect when user focuses the configured input, clear the dummy dots to allow clean paste/type
  const handleFocus = () => {
    setIsFocused(true);
    if (isConfigured && apiKey === "••••••••••••••••••••••••••••••••") {
      setApiKey("");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (isConfigured && apiKey.trim() === "") {
      setApiKey("••••••••••••••••••••••••••••••••");
    }
  };

  const handleCopyCut = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || apiKey === "••••••••••••••••••••••••••••••••") {
      setError("กรุณาใส่ API Key ที่ถูกต้อง");
      return;
    }

    setError("");
    setSuccess(false);

    startTransition(async () => {
      const res = await saveAIProviderKey(providerId, apiKey);
      if (res.success) {
        setSuccess(true);
        // Keep dummy dots representing the newly saved key
        setApiKey("••••••••••••••••••••••••••••••••");
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

  const hasNewValue = apiKey !== "" && apiKey !== "••••••••••••••••••••••••••••••••";

  return (
    <div 
      className={`relative rounded-2xl border transition-all duration-300 p-5 group ${
        isConfigured 
          ? "border-emerald-200 bg-emerald-500/[0.015] hover:border-emerald-300 hover:bg-emerald-500/[0.02]" 
          : "border-slate-200 bg-slate-50 hover:border-slate-300"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        {/* API Provider Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Key className={`w-4 h-4 ${isConfigured ? "text-emerald-500" : "text-slate-400"}`} />
              {name}
            </h3>
            
            {isConfigured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 shadow-sm animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                เชื่อมต่อแล้ว
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>
        
        {/* Form Controls */}
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
                  className={`w-full rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 select-none font-mono ${
                    isConfigured 
                      ? "bg-white border border-emerald-200 text-emerald-700 placeholder:text-emerald-400 focus:ring-emerald-500/20 focus:border-emerald-500" 
                      : "bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    msUserSelect: "none",
                    MozUserSelect: "none"
                  }}
                />
                
                {isConfigured && apiKey === "••••••••••••••••••••••••••••••••" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-emerald-600/80 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md select-none pointer-events-none">
                    🔒 ป้องกันคัดลอก
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1">
                {isReadOnly ? (
                  <span className="px-3 py-2 text-xs rounded-xl border border-slate-200 text-slate-400 font-medium bg-slate-50">
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
                        className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 active:bg-red-100 transition-colors flex items-center justify-center disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    )}
                    <button 
                      type="submit" 
                      disabled={isPending || isDeleting || (!hasNewValue && isConfigured)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border flex items-center justify-center gap-1.5 shadow-sm min-w-[80px] disabled:opacity-40 disabled:pointer-events-none ${
                        isConfigured 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 hover:border-emerald-700" 
                          : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
                      }`}
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {isConfigured ? "Update" : "Save"}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Feedback messages */}
            {success && (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                บันทึกการตั้งค่าเรียบร้อยแล้ว!
              </p>
            )}
            
            {error && (
              <p className="text-xs font-semibold text-red-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </form>
        </div>
        
      </div>
    </div>
  );
}
