"use client";

import React, { useState } from "react";
import {
  FAQCategory,
  FAQ_CATEGORIES,
  FAQ_CATEGORY_STYLES,
  FAQ_DATA,
} from "./faq-data";
import { BookOpen, ChevronDown, HelpCircle, Search } from "lucide-react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FAQCategory>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredFAQ = FAQ_DATA.filter((item) => {
    const matchesTab = activeTab === "all" || item.category === activeTab;
    const matchesSearch =
      normalizedQuery === "" ||
      item.question.toLowerCase().includes(normalizedQuery) ||
      item.answer.toLowerCase().includes(normalizedQuery) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(normalizedQuery));
    return matchesTab && matchesSearch;
  });

  const toggleAccordion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
      {/* Header Hero Card */}
      <header className="relative overflow-hidden rounded-[2rem] neu-raised neu-mesh-card neu-grain p-8 md:p-11">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full neu-tint-primary text-xs font-bold tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            Knowledge Base & Support
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
            คลังความรู้ & คำถามที่พบบ่อย{" "}
            <span className="text-primary">(KM & FAQ)</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl text-sm md:text-base leading-relaxed">
            แหล่งรวมคู่มือ ข้อสงสัย และวิธีการตั้งค่าเครื่องมือ AI (Google Veo, Imagen, Luma, Kling) ในระบบ Vibe Post เพื่อให้คุณใช้งานได้อย่างมีประสิทธิภาพสูงสุด
          </p>
        </div>
      </header>

      {/* Main Interactive Controls */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between neu-raised neu-grain p-4 rounded-[1.75rem]">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {FAQ_CATEGORIES.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(cat.id);
                    setOpenIndex(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "neu-pressed text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80 shrink-0">
            <input
              type="text"
              placeholder="ค้นหาคู่มือ/คำค้น เช่น Veo, คีย์..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null);
              }}
              className="w-full px-5 py-2.5 pr-10 rounded-full neu-pressed bg-[var(--surface-recessed)] border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs font-medium placeholder:text-muted-foreground text-foreground transition-all"
            />
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((faq, index) => {
              const isOpen = openIndex === index;
              const style = FAQ_CATEGORY_STYLES[faq.category];
              return (
                <div
                  key={faq.question}
                  className={`rounded-[1.75rem] neu-raised neu-grain transition-all duration-300 overflow-hidden ${
                    isOpen ? "ring-1 ring-primary/40" : "hover:-translate-y-0.5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left outline-none"
                  >
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 min-w-0">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${style.badgeClass}`}
                      >
                        {style.label}
                      </span>
                      <span className="font-display font-bold text-sm md:text-base text-foreground tracking-tight leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[560px] border-t border-border/60" : "max-h-0"
                    }`}
                  >
                    <div className="p-6 text-xs md:text-sm text-muted-foreground leading-relaxed font-medium bg-[var(--surface-recessed)]/65 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center neu-raised neu-grain rounded-[2rem]">
              <div className="w-16 h-16 neu-pressed rounded-2xl flex items-center justify-center mb-4">
                <HelpCircle className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-1">
                ไม่พบข้อมูลที่ค้นหา
              </h3>
              <p className="text-muted-foreground text-xs max-w-xs">
                ลองใช้คำค้นหาอื่นๆ เช่น Veo, คีย์ หรือเลือกหมวดหมู่อื่นเพื่อค้นหาคำตอบ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
