"use client";

import React from "react";

type PostType = "single" | "multi" | "video";

type Props = {
  onSelect: (type: PostType) => void;
};

const POST_TYPES = [
  {
    id: "single" as PostType,
    icon: "📸",
    title: "Single Photo",
    titleTh: "ภาพเดี่ยว",
    desc: "โพสต์พร้อมรูปภาพ 1 รูป หรือข้อความเพียงอย่างเดียว",
    features: ["1 รูปภาพ", "AI สร้างข้อความ", "กำหนดเวลาได้"],
    color: "red",
    available: true,
  },
  {
    id: "multi" as PostType,
    icon: "🖼️",
    title: "Multi-Photo",
    titleTh: "หลายภาพ",
    desc: "โพสต์แบบ Album เรียง 4, 6, 8 หรือ 10 รูปในโพสต์เดียว",
    features: ["4 / 6 / 8 / 10 รูป", "AI สร้างข้อความ", "Facebook Album"],
    color: "blue",
    available: true,
  },
  {
    id: "video" as PostType,
    icon: "🎬",
    title: "Video",
    titleTh: "วิดีโอ",
    desc: "โพสต์วิดีโอพร้อมข้อความบรรยาย",
    features: ["MP4 / MOV", "AI สร้างข้อความ", "Coming Soon"],
    color: "purple",
    available: false,
  },
];

const colorMap = {
  red: {
    border: "border-red-200 hover:border-red-400",
    icon: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    btn: "bg-red-600 hover:bg-red-700",
    ring: "ring-red-500",
  },
  blue: {
    border: "border-blue-200 hover:border-blue-400",
    icon: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700",
    ring: "ring-blue-500",
  },
  purple: {
    border: "border-slate-200",
    icon: "bg-slate-50",
    badge: "bg-slate-100 text-slate-500",
    btn: "bg-slate-400 cursor-not-allowed",
    ring: "ring-slate-300",
  },
};

export function PostTypePicker({ onSelect }: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">เลือกประเภท Post</h2>
        <p className="text-slate-500 text-sm">เลือกรูปแบบที่ต้องการสร้างเนื้อหา</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {POST_TYPES.map((type) => {
          const colors = colorMap[type.color as keyof typeof colorMap];
          return (
            <button
              key={type.id}
              onClick={() => type.available && onSelect(type.id)}
              disabled={!type.available}
              className={`
                relative text-left p-6 rounded-2xl border-2 transition-all duration-200 group
                ${type.available ? `${colors.border} cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-white` : "border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed"}
              `}
            >
              {/* Coming Soon Badge */}
              {!type.available && (
                <span className="absolute top-4 right-4 text-xs font-bold bg-slate-200 text-slate-500 px-2 py-1 rounded-full">
                  เร็วๆ นี้
                </span>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 ${colors.icon} rounded-2xl flex items-center justify-center mb-4 text-3xl transition-transform group-hover:scale-110`}>
                {type.icon}
              </div>

              {/* Title */}
              <div className="mb-1">
                <h3 className="text-lg font-bold text-slate-800">{type.title}</h3>
                <p className="text-sm text-slate-400 font-medium">{type.titleTh}</p>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-500 mt-2 mb-4 leading-relaxed">{type.desc}</p>

              {/* Features */}
              <div className="space-y-1.5">
                {type.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full ${type.available ? "bg-green-400" : "bg-slate-300"}`} />
                    <span className={type.available ? "text-slate-600" : "text-slate-400"}>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {type.available && (
                <div className={`mt-5 w-full py-2.5 rounded-xl text-white text-sm font-bold text-center ${colors.btn} transition-colors`}>
                  เลือก {type.title} →
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
