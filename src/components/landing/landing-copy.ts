import type { LandingCopy, LandingLang, LandingPost } from "./landing-types";

export const LANDING_COPY: Record<LandingLang, LandingCopy> = {
  th: {
    badge: "VibePost AI Studio · Multi-Channel Auto-Publisher",
    heroTitleLine1: "เนรมิตและเผยแพร่คอนเทนต์",
    heroTitleAccent: "อัตโนมัติทุก Channel",
    desc: "รวมพลัง AI Studio สร้างภาพ วิดีโอ และแคปชัน 3 สไตล์ พร้อมส่งออกไปยัง Facebook, Instagram, X, LinkedIn, LINE และ TikTok แบบ Real-time",
    ctaStudio: "เข้าสู่สตูดิโอ",
    ctaGallery: "ดูผลงานล่าสุด",
    demoTag: "Mockup Demo Mode",
    totalPosts: "โพสต์ทั้งหมด",
    platforms: "แพลตฟอร์ม",
    success: "การส่งออกสำเร็จ",
    channels: "ช่องทางที่เชื่อมต่อ:",
    latest: "Gallery ผลงานล่าสุด",
    login: "เข้าสู่ระบบ",
    items: "รายการ",
    footerPrefix: "ขับเคลื่อนด้วย",
    footerLink: "VibePost Auto-Post System",
    footerSuffix: "อัปเดตอัตโนมัติแบบ Real-time",
  },
  en: {
    badge: "VibePost AI Studio · Multi-Channel Auto-Publisher",
    heroTitleLine1: "Automated Content",
    heroTitleAccent: "Across All Channels",
    desc: "Generate studio-grade visuals, videos, and multi-tone captions with AI, then publish seamlessly across Facebook, Instagram, X, LinkedIn, LINE, and TikTok.",
    ctaStudio: "Open Studio",
    ctaGallery: "Explore Gallery",
    demoTag: "Mockup Demo Mode",
    totalPosts: "Total Posts",
    platforms: "Platforms",
    success: "Successful Exports",
    channels: "Active Channels:",
    latest: "Latest Posts Gallery",
    login: "Sign In",
    items: "Items",
    footerPrefix: "Powered by",
    footerLink: "VibePost Auto-Post System",
    footerSuffix: "Real-time Auto-Sync",
  },
  cn: {
    badge: "VibePost AI Studio · 全渠道自动发布引擎",
    heroTitleLine1: "全渠道智能内容创作",
    heroTitleAccent: "一键自动发布作品集",
    desc: "结合 AI Studio 生成视觉图像、视频与多风格文案，实时同步发布至 Facebook、Instagram、X、LinkedIn、LINE 与 TikTok。",
    ctaStudio: "进入工作台",
    ctaGallery: "查看最新作品",
    demoTag: "演示模式",
    totalPosts: "总发帖数",
    platforms: "平台",
    success: "发布成功",
    channels: "已连接渠道:",
    latest: "最新帖子作品集",
    login: "登录",
    items: "项目",
    footerPrefix: "技术支持",
    footerLink: "VibePost Auto-Post System",
    footerSuffix: "实时自动更新",
  },
};

const DEMO_TIMESTAMPS = [
  "2026-11-13T07:00:00.000Z",
  "2026-11-12T14:00:00.000Z",
  "2026-11-11T10:30:00.000Z",
  "2026-11-10T09:00:00.000Z",
];

export function getDemoPosts(lang: LandingLang): LandingPost[] {
  const texts: Record<LandingLang, [string, string, string, string]> = {
    th: [
      "ตื่นเต้นมากที่จะประกาศฟีเจอร์ AI Studio รุ่นใหม่! ทีมงานของเราออกแบบเวิร์กโฟลว์ให้ผลิตคอนเทนต์และตั้งเวลาโพสต์ได้ในไม่กี่วินาที #TechUpdate #VibePost",
      "สุขสันต์วันศุกร์ทุกคน! วันหยุดสุดสัปดาห์นี้มีแคมเปญไหนที่อยากให้ AI ช่วยปั้นแคปชันบ้าง? บอกเราในคอมเมนต์ได้เลย!",
      "รู้หรือไม่? การโพสต์สม่ำเสมอด้วยข้อความที่ปรับโทนให้เหมาะกับแต่ละแพลตฟอร์มช่วยเพิ่ม Engagement ได้กว่า 300% เริ่มอัตโนมัติวันนี้!",
      "มาดูวิดีโอสาธิตผลิตภัณฑ์ล่าสุดของเรา! UI โฉมใหม่ช่วยให้การจัดการหลายแบรนด์เป็นเรื่องง่าย ดูให้จบมีเซอร์ไพรส์!",
    ],
    en: [
      "Excited to announce our upgraded AI Studio release! Generate multi-tone captions and schedule across every channel in seconds. #TechUpdate #VibePost",
      "Happy Friday everyone! Which weekend campaign are you automating next? Tell us in the comments below!",
      "Did you know? Consistent cross-platform publishing tailored per channel can boost engagement by over 300%. Automate your workflow today!",
      "Check out our latest product demo! The new tactile Omni-Studio UI makes managing multiple brands effortless.",
    ],
    cn: [
      "很高兴宣布全新 AI Studio 升级上线！几秒钟内生成多风格文案并自动排期发布到各大平台。#TechUpdate #VibePost",
      "大家周五快乐！这个周末你计划自动化哪个品牌的推广内容？欢迎在评论区分享！",
      "你知道吗？针对不同平台语气持续发布内容，可将互动率提升 300% 以上。今天就开启自动化工作流吧！",
      "快来看看我们最新的产品演示！全新交互界面让多品牌内容管理变得轻松高效。",
    ],
  };

  const t = texts[lang];
  return [
    {
      id: "demo-1",
      content: t[0],
      publishedTime: DEMO_TIMESTAMPS[0],
      channels: [
        { platform: "FACEBOOK", accountName: "VibePost Brand" },
        { platform: "INSTAGRAM", accountName: "@vibepost" },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop",
          fileName: "feature.jpg",
        },
      ],
    },
    {
      id: "demo-2",
      content: t[1],
      publishedTime: DEMO_TIMESTAMPS[1],
      channels: [
        { platform: "TWITTER", accountName: "@vibepost" },
        { platform: "LINKEDIN", accountName: "VibePost Inc." },
      ],
      images: [
        {
          url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop",
          fileName: "weekend.jpg",
        },
      ],
    },
    {
      id: "demo-3",
      content: t[2],
      publishedTime: DEMO_TIMESTAMPS[2],
      channels: [
        { platform: "FACEBOOK", accountName: "VibePost Brand" },
        { platform: "TWITTER", accountName: "@vibepost" },
        { platform: "LINKEDIN", accountName: "VibePost Inc." },
      ],
      images: [],
    },
    {
      id: "demo-4",
      content: t[3],
      publishedTime: DEMO_TIMESTAMPS[3],
      channels: [
        { platform: "FACEBOOK", accountName: "VibePost Brand" },
        { platform: "INSTAGRAM", accountName: "@vibepost" },
      ],
      images: [
        {
          url: "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4",
          fileName: "demo_video.mp4",
          type: "video",
        },
      ],
    },
  ];
}
