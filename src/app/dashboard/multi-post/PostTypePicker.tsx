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
    features: ["MP4 / MOV / WEBM", "AI ค้นหา/สร้างวิดีโอ", "กำหนดเวลาได้"],
    color: "purple",
    available: true,
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
    border: "border-purple-200 hover:border-purple-400",
    icon: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    btn: "bg-purple-600 hover:bg-purple-700",
    ring: "ring-purple-500",
  },
};

export function PostTypePicker({ onSelect }: Props) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">เลือกประเภท Post</h2>
        <p className="text-slate-500 text-base md:text-lg">เลือกรูปแบบที่ต้องการสร้างเนื้อหาเพื่อเริ่มต้น</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
        {POST_TYPES.map((type) => {
          const colors = colorMap[type.color as keyof typeof colorMap];
          return (
            <button
              key={type.id}
              onClick={() => type.available && onSelect(type.id)}
              disabled={!type.available}
              className={`
                relative text-left p-8 rounded-3xl border-2 transition-all duration-300 group
                flex flex-col justify-between min-h-[420px]
                ${type.available ? `${colors.border} cursor-pointer hover:shadow-xl hover:scale-[1.03] bg-white` : "border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed"}
              `}
            >
              <div>
                {/* Coming Soon Badge */}
                {!type.available && (
                  <span className="absolute top-5 right-5 text-xs font-extrabold bg-slate-200 text-slate-500 px-3 py-1.5 rounded-full">
                    เร็วๆ นี้
                  </span>
                )}

                {/* Icon */}
                <div className={`w-20 h-20 ${colors.icon} rounded-2xl flex items-center justify-center mb-6 text-5xl transition-transform group-hover:scale-110 shadow-sm`}>
                  {type.icon}
                </div>

                {/* Title */}
                <div className="mb-3">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{type.title}</h3>
                  <p className={`text-base font-semibold mt-0.5 ${type.available ? "text-slate-500" : "text-slate-400"}`}>{type.titleTh}</p>
                </div>

                {/* Description */}
                <p className="text-base text-slate-600 mt-3 mb-6 leading-relaxed">{type.desc}</p>

                {/* Features */}
                <div className="space-y-2.5">
                  {type.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium">
                      <span className={`w-2 h-2 rounded-full ${type.available ? "bg-green-500" : "bg-slate-300"}`} />
                      <span className={type.available ? "text-slate-700" : "text-slate-400"}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              {type.available && (
                <div className={`mt-8 w-full py-3.5 rounded-2xl text-white text-base font-black text-center ${colors.btn} transition-colors shadow-md group-hover:shadow-lg`}>
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
