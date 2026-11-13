"use client";

import React, { useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { MANUAL_TABS, ONBOARDING_STEPS } from "./manual-data";
import { ManualHeaderAndTracker } from "./ManualHeaderAndTracker";
import { ManualCoreSections } from "./ManualCoreSections";
import { ManualOpsSections } from "./ManualOpsSections";

const STORAGE_KEY = "vibepost_training_completed_steps";
const EMPTY_STEPS: string[] = [];
let cachedRawSteps: string | null = null;
let cachedParsedSteps: string[] = EMPTY_STEPS;
const stepListeners = new Set<() => void>();

function subscribeCompletedSteps(listener: () => void) {
  stepListeners.add(listener);
  return () => {
    stepListeners.delete(listener);
  };
}

function getCompletedStepsSnapshot(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRawSteps) return cachedParsedSteps;
    cachedRawSteps = raw;
    cachedParsedSteps = raw ? (JSON.parse(raw) as string[]) : EMPTY_STEPS;
    return cachedParsedSteps;
  } catch {
    return EMPTY_STEPS;
  }
}

function getCompletedStepsServerSnapshot(): string[] {
  return EMPTY_STEPS;
}

export default function TrainingManualPage() {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const completedSteps = useSyncExternalStore(
    subscribeCompletedSteps,
    getCompletedStepsSnapshot,
    getCompletedStepsServerSnapshot
  );

  const toggleStep = (id: string) => {
    const updated = completedSteps.includes(id)
      ? completedSteps.filter((s) => s !== id)
      : [...completedSteps, id];
    try {
      const nextRaw = JSON.stringify(updated);
      localStorage.setItem(STORAGE_KEY, nextRaw);
      cachedRawSteps = nextRaw;
      cachedParsedSteps = updated;
      stepListeners.forEach((listener) => listener());
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyAll = () => {
    const fullText = document.getElementById("manual-content")?.innerText || "";
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const progressPercent = Math.round(
    (completedSteps.length / ONBOARDING_STEPS.length) * 100
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const shouldShowSection = (sectionId: string): boolean => {
    const matchesTab = activeTab === "all" || activeTab === sectionId;
    if (!matchesTab) return false;
    if (!normalizedQuery) return true;
    const meta = MANUAL_TABS.find((t) => t.id === sectionId);
    if (!meta) return true;
    return (
      meta.label.toLowerCase().includes(normalizedQuery) ||
      meta.keywords.toLowerCase().includes(normalizedQuery)
    );
  };

  const anySectionVisible = MANUAL_TABS.some(
    (tab) => tab.id !== "all" && shouldShowSection(tab.id)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-6xl mx-auto pb-16">
      <ManualHeaderAndTracker
        copied={copied}
        completedSteps={completedSteps}
        progressPercent={progressPercent}
        onCopyAll={handleCopyAll}
        onPrint={handlePrint}
        onToggleStep={toggleStep}
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between neu-raised neu-grain p-4 rounded-3xl">
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {MANUAL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "neu-pressed text-muted-foreground hover:text-foreground border border-[var(--hairline-border)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="ค้นหาคู่มือ เช่น Veo, Draft, Kling..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--hairline-border)] neu-pressed text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/35"
          />
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Manual Detailed Content Body */}
      <div id="manual-content" className="space-y-8 text-foreground">
        <ManualCoreSections shouldShow={shouldShowSection} />
        <ManualOpsSections shouldShow={shouldShowSection} />

        {!anySectionVisible && (
          <div className="neu-raised neu-grain rounded-3xl p-10 text-center space-y-2">
            <p className="text-sm font-bold text-foreground">
              ไม่พบหัวข้อคู่มือที่ตรงกับ &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveTab("all");
              }}
              className="text-xs font-bold text-primary hover:underline"
            >
              แสดงหัวข้อทั้งหมด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
