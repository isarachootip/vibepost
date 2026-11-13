"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

type PostType = "single" | "multi" | "sequential" | "video";

type Props = {
  onSelect: (type: PostType) => void;
};

interface PostTypeConfig {
  id: PostType;
  icon: string;
  title: string;
  titleTh: string;
  desc: string;
  features: string[];
  iconTint: string;
  btnClass: string;
  accentRing: string;
}

const POST_TYPES: PostTypeConfig[] = [
  {
    id: "single",
    icon: "📸",
    title: "Single Photo",
    titleTh: "ภาพเดี่ยว",
    desc: "โพสต์พร้อมรูปภาพ 1 รูป หรือข้อความเพียงอย่างเดียว",
    features: ["1 รูปภาพ", "AI สร้างข้อความ", "กำหนดเวลาได้"],
    iconTint: "neu-tint-primary",
    btnClass: "bg-primary text-primary-foreground hover:brightness-110",
    accentRing: "hover:ring-1 hover:ring-primary/50",
  },
  {
    id: "multi",
    icon: "🖼️",
    title: "Album Post",
    titleTh: "หลายภาพใน Post เดียว",
    desc: "รูปหลายรูปรวมใน Post เดียว แบบ Facebook Album ลากเรียงลำดับได้",
    features: ["1–10 รูป อิสระ", "Drag & Drop เรียงลำดับ", "Facebook Album"],
    iconTint: "neu-tint-teal",
    btnClass: "bg-teal-600 text-white hover:bg-teal-500",
    accentRing: "hover:ring-1 hover:ring-teal-500/50",
  },
  {
    id: "sequential",
    icon: "📋",
    title: "Sequential Posts",
    titleTh: "หลายโพสต์ต่อเนื่อง",
    desc: "แต่ละรูปเป็น Post แยกกัน โพสต์ต่อเนื่องตามลำดับเวลา เหมือนภาพโฆษณาต่อเนื่องใน Facebook Feed",
    features: ["รูปละ 1 Post แยกกัน", "ตั้ง Interval อัตโนมัติ", "Drag & Drop เรียงลำดับ"],
    iconTint: "bg-amber-500/12 text-amber-600 dark:text-amber-300 border border-amber-500/25",
    btnClass: "bg-amber-600 text-white hover:bg-amber-500",
    accentRing: "hover:ring-1 hover:ring-amber-500/50",
  },
  {
    id: "video",
    icon: "🎬",
    title: "Video",
    titleTh: "วิดีโอ",
    desc: "โพสต์วิดีโอพร้อมข้อความบรรยาย",
    features: ["MP4 / MOV / WEBM", "AI ค้นหา/สร้างวิดีโอ", "กำหนดเวลาได้"],
    iconTint: "bg-sky-500/12 text-sky-600 dark:text-sky-300 border border-sky-500/25",
    btnClass: "bg-sky-600 text-white hover:bg-sky-500",
    accentRing: "hover:ring-1 hover:ring-sky-500/50",
  },
];

export function PostTypePicker({ onSelect }: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-2 md:py-4">
      <div className="text-center mb-6 md:mb-10">
        <h2 className="font-display text-2xl md:text-4xl font-extrabold text-foreground mb-2 tracking-tight">
          เลือกประเภท Post
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          เลือกรูปแบบที่ต้องการสร้างเนื้อหาเพื่อเริ่มต้น
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {POST_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onSelect(type.id)}
            className={`relative text-left p-6 md:p-7 rounded-3xl neu-raised neu-grain transition-all duration-300 group flex flex-col justify-between min-h-[260px] md:min-h-[390px] cursor-pointer hover:-translate-y-1 ${type.accentRing}`}
          >
            <div>
              <div
                className={`w-14 h-14 md:w-16 md:h-16 ${type.iconTint} rounded-2xl flex items-center justify-center mb-5 text-3xl md:text-4xl transition-transform group-hover:scale-110`}
              >
                {type.icon}
              </div>

              <div className="mb-3">
                <h3 className="font-display text-lg md:text-2xl font-extrabold text-foreground tracking-tight">
                  {type.title}
                </h3>
                <p className="text-xs md:text-sm font-semibold mt-0.5 text-muted-foreground">
                  {type.titleTh}
                </p>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground mt-1 mb-5 leading-relaxed">
                {type.desc}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {type.features.map((f) => (
                  <span
                    key={f}
                    className="neu-pressed px-2.5 py-1 rounded-full text-[11px] font-semibold text-foreground/85 inline-flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div
              className={`mt-6 w-full py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold text-center flex items-center justify-center gap-1.5 ${type.btnClass} shadow-sm transition-all`}
            >
              เลือก {type.title}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
