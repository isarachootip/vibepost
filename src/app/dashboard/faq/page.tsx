"use client";

import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
  category: "all" | "video" | "image" | "text" | "security" | "workflow";
  keywords: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    category: "workflow",
    question: "กระบวนการทำงานภาพรวม (End-to-End Process) จาก AI Studio สู่ Auto-Post ทำงานอย่างไร?",
    answer: "ระบบออกแบบมาเพื่อรองรับ 2 โหมดการทำงานหลักตามสไตล์ครีเอเตอร์:\n\n1. **โหมด Fast-Track (ทำเสร็จปุ๊บ สั่งโพสต์ปั๊บ)**:\n   เมื่อคุณสร้างแคปชันและรูปภาพ/วิดีโอใน **AI Studio** เสร็จแล้ว สามารถกดปุ่ม **'🚀 เผยแพร่ทันที / ตั้งเวลา Auto-Post'** เพื่อเปิดหน้าต่างเลือกเพจ Facebook/Instagram และกำหนดวัน-เวลา แล้วกดยืนยันเพื่อนำเข้าคิว Auto-Post ได้ทันทีในคลิกเดียว\n\n2. **โหมด Batch Production (ทำตุนไว้ในสต็อก แล้วค่อยทยอยโพสต์)**:\n   เมื่อเจนคอนเทนต์เสร็จ ให้กดปุ่ม **'💾 บันทึกเป็นแบบร่าง (Draft)'** เพื่อเก็บเข้า **'คลังแบบร่างรอโพสต์ (Drafts Queue)'** จากนั้นสามารถเข้าไปที่หน้า **Post History -> คลังแบบร่างรอโพสต์** เพื่อดูรายการทั้งหมด แล้วคลิกปุ่ม **'🚀 ตั้งค่า & สั่งโพสต์'** ทีละโพสต์ตามแผนการตลาด",
    keywords: ["workflow", "process", "autopost", "ขั้นตอน", "การทำงาน", "กระบวนการ", "สตูดิโอ", "ai studio", "draft", "คลังแบบร่าง"]
  },
  {
    category: "workflow",
    question: "ปุ่ม 'บันทึกเป็นแบบร่าง (Save Draft)' กับ 'เผยแพร่ทันที / ตั้งเวลา Auto-Post' ต่างกันอย่างไร?",
    answer: "- **💾 บันทึกเป็นแบบร่าง (Save Draft)**: จัดเก็บข้อความแคปชันและไฟล์รูปภาพ/วิดีโอ AI ลงในฐานข้อมูลสถานะ `DRAFT` โดยยังไม่ผูกกับวันเวลาโพสต์ เหมาะสำหรับการผลิตคอนเทนต์ตุนไว้หลายๆ ชิ้นในคราวเดียว\n- **🚀 เผยแพร่ทันที / ตั้งเวลา Auto-Post (Instant Publisher)**: เชื่อมโยงคอนเทนต์เข้ากับเพจโซเชียลมีเดียที่เลือก พร้อมกำหนดเวลา (Schedule) หรือโพสต์ทันที (Post Now) และส่งเข้าสู่ระบบ Auto-Publisher Cron โดยตรง",
    keywords: ["draft", "save", "บันทึก", "แบบร่าง", "ต่างกัน", "autopost", "instant", "เผยแพร่ทันที"]
  },
  {
    category: "workflow",
    question: "หน้ารวมคลังแบบร่างรอโพสต์ (Drafts Queue) อยู่ที่ไหน และใช้งานอย่างไร?",
    answer: "คุณสามารถเข้าใช้งานได้ที่เมนู **Post History (ประวัติโพสต์ & คลังเนื้อหา)** -> เลือกแท็บ **'📝 คลังแบบร่างรอโพสต์ (Drafts Queue)'**:\n\n- แสดงการ์ดของทุกคอนเทนต์ที่ทำตุนไว้ พร้อม Thumbnail รูปภาพ/วิดีโอ และข้อความแคปชัน\n- กดปุ่ม **'🚀 ตั้งค่า & สั่งโพสต์'** บนการ์ดใดก็ได้ เพื่อเปิดหน้าต่างเลือกเพจและตั้งเวลาปล่อยโพสต์ได้ทันที\n- กดปุ่ม **'✏️ แก้ไข'** เพื่อเปิดปรับแต่งแบบละเอียดใน AI Content Publisher\n- กดปุ่ม **'🗑️ ลบ'** เพื่อย้ายแบบร่างที่ไม่ใช้งานลงถังขยะ",
    keywords: ["คลังแบบร่าง", "drafts queue", "หน้ารวม", "รอโพสต์", "post history", "จัดการโพสต์"]
  },
  {
    category: "video",
    question: "ระบบ BizNext จัดลำดับความสำคัญของค่าย AI ในการสร้างวิดีโออย่างไร?",
    answer: "ระบบมีกลไกตรวจสอบลำดับความสำคัญในการเรนเดอร์วิดีโอ (Cascade Logic) ดังนี้:\n\n1. **Google Veo 2.0 (Gemini)**: ทำงานเป็นอันดับแรกหากมีคีย์ Google Gemini\n2. **Luma Dream Machine**: ทำงานเป็นลำดับที่สองหากมีคีย์ Luma และคีย์ Gemini ไม่ได้ใช้งานหรือเกิดข้อผิดพลาด\n3. **Kling AI**: ทำงานเป็นลำดับที่สามหากมีคีย์ Kling\n4. **Curated Videos (Pexels)**: หากไม่มีคีย์ของค่ายใดเลย หรือการสร้างจาก AI ทั้งหมดล้มเหลว ระบบจะดึงไฟล์วิดีโอสต็อกคุณภาพสูงที่เราคัดสรรไว้มาแสดงผลเป็น Fallback ทันที เพื่อป้องกันโพสต์ขาดสื่อประกอบ",
    keywords: ["วิดีโอ", "veo", "luma", "kling", "pexels", "fallback", "video", "ลำดับ"]
  },
  {
    category: "video",
    question: "วิธีการตั้งค่าใช้งาน Google Veo และ Gemini (Nano Banana) ต้องใช้ API Key อะไรบ้าง?",
    answer: "สะดวกมาก! คุณใช้เพียง **Google Gemini API Key** ชุดเดียวจาก [Google AI Studio](https://aistudio.google.com/) จากนั้นนำมากรอกในหน้า **Settings -> Google Gemini** ระบบจะนำคีย์นี้ไปประมวลผลร่วมกันทั้งหมด ครอบคลุมการเขียนสคริปต์ (Gemini), การเจนรูปต้นแบบ/Character Seed (Imagen 4.0 Fast) และการสร้างวิดีโอเคลื่อนไหว (Google Veo)",
    keywords: ["veo", "gemini", "banana", "key", "settings", "api", "studio", "ตั้งค่า"]
  },
  {
    category: "image",
    question: "ระบบสร้างรูปภาพ 'Nano Banana' (Imagen) ทำงานร่วมกับโมดูลวิดีโออย่างไร?",
    answer: "ในห้องสร้างสรรค์เนื้อหา (AI Studio) คุณสามารถเจนรูปภาพคีย์เฟรมด้วย Gemini Imagen 4.0 ได้ทันที จากนั้นรูปภาพที่สร้างสำเร็จ (MediaAsset) จะถูกใช้เป็น **Image Reference** หรือ **Character Seed** เพื่อส่งต่อให้ AI Video (เช่น Luma, Kling หรือ Veo) นำไปเรนเดอร์เป็นภาพเคลื่อนไหวที่ควบคุมความสม่ำเสมอของสไตล์ตัวละครหรือโทนสีได้เป็นอย่างดี",
    keywords: ["ภาพ", "รูป", "imagen", "reference", "seed", "character", "สไตล์", "คุมโทน"]
  },
  {
    category: "image",
    question: "ระบบสำรองรูปภาพสต็อก (Image Fallback) จะทำงานตอนไหน?",
    answer: "เมื่อระบบประมวลผลการเจนภาพด้วย AI แบบฟรี (Pollinations.ai) หรือ API เกิดปัญหาคิวเต็ม หรือชนขีดจำกัด IP ของเซิร์ฟเวอร์ VPS ระบบจะใช้กลไก Fail-safe อัตโนมัติ โดยการถอดคำสำคัญ (Tags) ออกมาจาก Prompt แล้วไปดาวน์โหลดภาพสต็อกทดแทนจาก **LoremFlickr** มาใช้งานให้ทันที เพื่อให้โพสต์สามารถทำงานต่อได้โดยไม่ล้มเหลว",
    keywords: ["ภาพ", "สต็อก", "loremflickr", "pollinations", "fallback", "รูป", "ฟรี"]
  },
  {
    category: "security",
    question: "วิธีใส่คีย์ Kling AI แบบสองคีย์ (AccessKey:SecretKey) ต้องกรอกอย่างไร?",
    answer: "เนื่องจาก Kling AI ต้องการ API Key สองรหัสคู่กัน ให้คุณกรอกในช่อง Kling API Key โดยใช้เครื่องหมายโคลอน `:` คั่นระหว่างคีย์ ตัวอย่างเช่น: `AccessKey_ตัวอย่าง:SecretKey_ตัวอย่าง` ระบบหลังบ้านจะแยกคีย์และนำไปสร้าง JWT Token เพื่อตรวจสอบสิทธิ์การใช้งานให้อัตโนมัติ",
    keywords: ["kling", "key", "secret", "access", "โคลอน", "คั่น", "settings"]
  },
  {
    category: "security",
    question: "คีย์ API ที่ใส่ลงไปในหน้า Settings มีความปลอดภัยอย่างไร?",
    answer: "คีย์ API ทั้งหมดที่ถูกกรอกจะถูกส่งผ่านโปรโตคอล HTTPS ที่ปลอดภัย และจะถูก**เข้ารหัสลับในฝั่งหลังบ้าน (Backend Server-side Encryption)** ก่อนนำไปจัดเก็บลงในฐานข้อมูล PostgreSQL เพื่อรับประกันความปลอดภัยของบัญชีผู้ใช้อย่างสูงสุด",
    keywords: ["ความปลอดภัย", "security", "encrypt", "คีย์", "settings", "api", "ปลอดภัย"]
  },
  {
    category: "text",
    question: "ระบบ One-Click 3 Formats ในห้อง AI Studio ทำงานอย่างไร?",
    answer: "เมื่อคุณกรอกหัวข้อและกดปุ่มสร้าง ระบบจะส่งคำสั่งไปยังโมเดลภาษาขนาดใหญ่ (เช่น Gemini หรือ Kimi) เพื่อสร้างเนื้อหา 3 รูปแบบพร้อมกันในคลิกเดียว ได้แก่:\n\n1. **Long-form**: บทความยาวสำหรับบล็อก\n2. **Social Caption**: ข้อความสั้นมีอีโมจิสำหรับ Facebook/Instagram\n3. **Marketing AIDA**: ข้อความโฆษณาตามหลัก Attention, Interest, Desire, Action\n\nผู้ใช้สามารถสลับอ่าน ปรับแก้ และกดบันทึกหรือกดแชร์แยกโพสต์กันได้อย่างเป็นอิสระ",
    keywords: ["text", "เขียน", "บทความ", "aida", "caption", "3 formats", "studio", "long-form"]
  }
];

const CATEGORIES = [
  { id: "all", label: "ทั้งหมด" },
  { id: "workflow", label: "🔄 กระบวนการโพสต์ (Workflow & Auto-Post)" },
  { id: "text", label: "✍️ การเขียนบทความ (Text AI)" },
  { id: "image", label: "🎨 ระบบรูปภาพ (Image AI)" },
  { id: "video", label: "🎬 ระบบวิดีโอ (Video AI)" },
  { id: "security", label: "🔒 ความปลอดภัย & คีย์" }
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FAQItem["category"] | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Filter logic
  const filteredFAQ = FAQ_DATA.filter((item) => {
    const matchesTab = activeTab === "all" || item.category === activeTab;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header section with modern glass gradient */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 md:p-12 text-white border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs font-semibold tracking-wider text-blue-400 uppercase">
            📖 Knowledge Base & Support
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-heading leading-tight drop-shadow-sm bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            คลังความรู้ & คำถามที่พบบ่อย (KM & FAQ)
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
            แหล่งรวมคู่มือ ข้อสงสัย และวิธีการตั้งค่าเครื่องมือ AI (Google Veo, Imagen, Luma, Kling) ในระบบ BizNext เพื่อให้คุณใช้งานได้อย่างมีประสิทธิภาพสูงสุด
          </p>
        </div>
      </header>

      {/* Main interactive controls */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveTab(cat.id as any);
                  setOpenIndex(null);
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === cat.id
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-150"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="ค้นหาคู่มือ/คำค้น เช่น Veo, คีย์..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setOpenIndex(null);
              }}
              className="w-full px-5 py-2.5 pr-10 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-xs font-medium placeholder-slate-400 shadow-inner bg-slate-50 focus:bg-white transition-all text-slate-800"
            />
            <svg
              className="absolute right-4 top-3 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-[2rem] border transition-all duration-300 ${
                    isOpen
                      ? "bg-white border-slate-300 shadow-md ring-2 ring-slate-100"
                      : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left outline-none"
                  >
                    <div className="flex items-center gap-4">
                      {/* Decorative category badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider ${
                          faq.category === "video"
                            ? "bg-blue-100 text-blue-700"
                            : faq.category === "image"
                            ? "bg-purple-100 text-purple-700"
                            : faq.category === "text"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {faq.category === "video"
                          ? "Video AI"
                          : faq.category === "image"
                          ? "Image AI"
                          : faq.category === "text"
                          ? "Text AI"
                          : "Security"}
                      </span>
                      <span className="font-heading font-extrabold text-sm md:text-base text-slate-800 tracking-tight leading-snug">
                        {faq.question}
                      </span>
                    </div>
                    <span
                      className={`text-slate-400 transform transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {/* Accordion Content */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[500px] border-t border-slate-100" : "max-h-0"
                    }`}
                  >
                    <div className="p-6 text-xs md:text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 rounded-b-[2rem] whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1 font-heading">ไม่พบข้อมูลที่ค้นหา</h3>
              <p className="text-slate-400 text-xs max-w-xs">ลองใช้คำค้นหาอื่นๆ เช่น Veo, คีย์ หรือเลือกหมวดหมู่อื่นเพื่อค้นหาคำตอบ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
