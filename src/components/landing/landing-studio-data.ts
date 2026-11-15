import type { LandingLang } from "./landing-types";

export type StudioIconKey =
  | "home"
  | "sparkles"
  | "wand"
  | "send"
  | "activity"
  | "layout";

export interface LandingDockItem {
  id: string;
  href: string;
  icon: StudioIconKey;
  label: string;
  active?: boolean;
}

export interface LandingStudioCard {
  id: string;
  href: string;
  icon: StudioIconKey;
  accent: "primary" | "teal";
  spec: string;
  title: string;
  description: string;
  cta: string;
}

export const LANDING_DOCK_ITEMS: Record<LandingLang, LandingDockItem[]> = {
  th: [
    { id: "home", href: "#top", icon: "home", label: "หน้าหลัก", active: true },
    { id: "studio", href: "/dashboard/ai-studio", icon: "sparkles", label: "AI Studio" },
    { id: "caption", href: "/dashboard/ai-caption", icon: "wand", label: "AI แคปชัน" },
    { id: "publisher", href: "/dashboard/multi-post", icon: "send", label: "สั่งโพสต์" },
    { id: "monitor", href: "/dashboard/monitor", icon: "activity", label: "ติดตามผล" },
    { id: "gallery", href: "#gallery", icon: "layout", label: "คลังผลงาน" },
  ],
  en: [
    { id: "home", href: "#top", icon: "home", label: "Home", active: true },
    { id: "studio", href: "/dashboard/ai-studio", icon: "sparkles", label: "AI Studio" },
    { id: "caption", href: "/dashboard/ai-caption", icon: "wand", label: "AI Caption" },
    { id: "publisher", href: "/dashboard/multi-post", icon: "send", label: "Publisher" },
    { id: "monitor", href: "/dashboard/monitor", icon: "activity", label: "Monitor" },
    { id: "gallery", href: "#gallery", icon: "layout", label: "Showcase" },
  ],
  cn: [
    { id: "home", href: "#top", icon: "home", label: "首页", active: true },
    { id: "studio", href: "/dashboard/ai-studio", icon: "sparkles", label: "AI 工作台" },
    { id: "caption", href: "/dashboard/ai-caption", icon: "wand", label: "AI 文案" },
    { id: "publisher", href: "/dashboard/multi-post", icon: "send", label: "多端发布" },
    { id: "monitor", href: "/dashboard/monitor", icon: "activity", label: "实时监控" },
    { id: "gallery", href: "#gallery", icon: "layout", label: "作品展示" },
  ],
};

export const LANDING_STUDIO_CARDS: Record<LandingLang, LandingStudioCard[]> = {
  th: [
    {
      id: "ai-studio",
      href: "/dashboard/ai-studio",
      icon: "sparkles",
      accent: "primary",
      spec: "Gemini 2.5 • Imagen • Veo",
      title: "AI Content Studio",
      description:
        "ป้อนบรีฟครั้งเดียว สร้างแคปชัน 3 สไตล์พร้อมกัน (บทความ, โซเชียล, AIDA) คู่ภาพและวิดีโอ AI ในคลิกเดียว",
      cta: "เปิดสตูดิโอ",
    },
    {
      id: "ai-caption",
      href: "/dashboard/ai-caption",
      icon: "wand",
      accent: "teal",
      spec: "Vision AI • 5 สไตล์",
      title: "AI Caption 5 Styles",
      description:
        "อัปโหลดภาพสินค้าหรือคลิป ให้ Vision AI วิเคราะห์จุดเด่นแล้วเสกแคปชัน 5 อารมณ์พร้อมปุ่มส่งโพสต์ทันที",
      cta: "เปิดสตูดิโอ",
    },
    {
      id: "multi-post",
      href: "/dashboard/multi-post",
      icon: "send",
      accent: "primary",
      spec: "FB • IG • X • LINE • TT",
      title: "Omni-Channel Publisher",
      description:
        "ตั้งเวลาและเผยแพร่ข้ามหลายเพจด้วย Wizard แยกปรับข้อความอัจฉริยะ รองรับทั้งโพสต์เดี่ยว อัลบั้ม และวิดีโอ",
      cta: "เปิดสตูดิโอ",
    },
    {
      id: "monitor",
      href: "/dashboard/monitor",
      icon: "activity",
      accent: "teal",
      spec: "Auto-Pilot • Analytics",
      title: "Drafts & Live Monitor",
      description:
        "บริหารคลังแบบร่างรอโพสต์ คิวงาน Cron อัตโนมัติ ติดตามสถานะทุกช่องทาง และสรุป Token AI เรียลไทม์",
      cta: "เปิดสตูดิโอ",
    },
  ],
  en: [
    {
      id: "ai-studio",
      href: "/dashboard/ai-studio",
      icon: "sparkles",
      accent: "primary",
      spec: "Gemini 2.5 • Imagen • Veo",
      title: "AI Content Studio",
      description:
        "One creative brief generates 3 copy styles (Long-form, Social, AIDA) paired with AI visuals and motion clips.",
      cta: "Open Studio",
    },
    {
      id: "ai-caption",
      href: "/dashboard/ai-caption",
      icon: "wand",
      accent: "teal",
      spec: "Vision AI • 5 Tones",
      title: "AI Caption 5 Styles",
      description:
        "Drop any product photo or clip—Vision AI extracts context and writes 5 tailored social captions ready to ship.",
      cta: "Open Studio",
    },
    {
      id: "multi-post",
      href: "/dashboard/multi-post",
      icon: "send",
      accent: "primary",
      spec: "FB • IG • X • LINE • TT",
      title: "Omni-Channel Publisher",
      description:
        "Schedule and dispatch single, album, sequential, or video posts across connected brand channels with live preview.",
      cta: "Open Studio",
    },
    {
      id: "monitor",
      href: "/dashboard/monitor",
      icon: "activity",
      accent: "teal",
      spec: "Auto-Pilot • Analytics",
      title: "Drafts & Live Monitor",
      description:
        "Manage your staged Drafts Queue, Cron scheduling pipeline, per-channel health, and real-time AI token cost tracking.",
      cta: "Open Studio",
    },
  ],
  cn: [
    {
      id: "ai-studio",
      href: "/dashboard/ai-studio",
      icon: "sparkles",
      accent: "primary",
      spec: "Gemini 2.5 • Imagen • Veo",
      title: "AI 内容创作工坊",
      description:
        "输入一次创意简报，同步生成 3 种风格文案并搭配 AI 视觉图像与短视频素材。",
      cta: "进入工坊",
    },
    {
      id: "ai-caption",
      href: "/dashboard/ai-caption",
      icon: "wand",
      accent: "teal",
      spec: "Vision AI • 5 种语气",
      title: "AI 五风格配文",
      description:
        "上传图片或视频，由 Vision AI 识别画面亮点并一键产出 5 种营销语气文案。",
      cta: "进入工坊",
    },
    {
      id: "multi-post",
      href: "/dashboard/multi-post",
      icon: "send",
      accent: "primary",
      spec: "FB • IG • X • LINE • TT",
      title: "全渠道发布向导",
      description:
        "支持单图、多图相册、连续贴与视频贴文，一键分平台自定义微调与定时发布。",
      cta: "进入工坊",
    },
    {
      id: "monitor",
      href: "/dashboard/monitor",
      icon: "activity",
      accent: "teal",
      spec: "Auto-Pilot • 数据监控",
      title: "草稿库与实时监控",
      description:
        "高效管理待发草稿、Cron 自动排期任务、各渠道发送状态及 AI Token 实时成本。",
      cta: "进入工坊",
    },
  ],
};
