export interface TrainingStep {
  id: string;
  title: string;
  description: string;
}

export interface ManualTab {
  id: string;
  label: string;
  keywords: string;
}

export const ONBOARDING_STEPS: TrainingStep[] = [
  {
    id: "step1",
    title: "1. ทำความเข้าใจภาพรวมระบบ & สิทธิ์ใน Workspace",
    description: "เข้าใจโครงสร้าง Multi-Workspace และบทบาทของ Admin, Member, Viewer",
  },
  {
    id: "step2",
    title: "2. เชื่อมต่อช่องทาง Facebook / Instagram",
    description: "ไปที่เมนู Integrations และล็อกอินเชื่อมต่อเพจโซเชียลมีเดียของแบรนด์",
  },
  {
    id: "step3",
    title: "3. ตั้งค่าคีย์ AI ในหน้า Settings",
    description: "กรอกคีย์ Google Gemini (คุมทั้ง Text, Imagen, Veo) และ Kling/Luma หากต้องการ",
  },
  {
    id: "step4",
    title: "4. ทดลองสร้างเนื้อหาใน AI Studio",
    description: "ป้อนบรีฟสินค้า เจนแคปชัน 3 สไตล์พร้อมกัน และสร้างภาพ/คลิปประกอบ",
  },
  {
    id: "step5",
    title: "5. ทดสอบ 3 เส้นทางการเผยแพร่คอนเทนต์",
    description: "ลองใช้ปุ่มโพสต์ทันที/ตั้งเวลา, บันทึกเป็นแบบร่าง (Draft), และเปิดใน Wizard ขั้นสูง",
  },
  {
    id: "step6",
    title: "6. ตรวจสอบคลังแบบร่างและติดตามผลใน Monitor",
    description: "ทดสอบการกด '🚀 ตั้งค่า & สั่งโพสต์' จาก Drafts Queue และดูประวัติใน Monitor",
  },
];

export const MANUAL_TABS: ManualTab[] = [
  { id: "all", label: "ทั้งหมด", keywords: "" },
  { id: "overview", label: "1. ภาพรวมระบบ", keywords: "workspace gemini veo luma kling auto-pilot" },
  { id: "setup", label: "2. ตั้งค่า & เชื่อมต่อ", keywords: "facebook instagram integrations settings api gemini kling jwt" },
  { id: "studio", label: "3. AI Studio", keywords: "ai studio long-form social aida imagen veo luma caption" },
  { id: "routes", label: "4. 3 เส้นทางโพสต์", keywords: "route draft auto-post wizard session bridge publisher" },
  { id: "drafts", label: "5. คลังแบบร่าง", keywords: "drafts queue history edit delete trash soft delete" },
  { id: "monitor", label: "6. ติดตามผล & ค่าใช้จ่าย", keywords: "monitor analytics scheduled publishing published failed token usd thb" },
  { id: "troubleshoot", label: "7. แก้ปัญหา", keywords: "failed token fallback settings troubleshoot error" },
  { id: "googledocs", label: "8. นำเข้า Google Docs", keywords: "google docs docx drive copy docs.new" },
];

export const OVERVIEW_PILLARS = [
  {
    icon: "layers" as const,
    title: "Multi-Workspace Isolation",
    body: "แยกข้อมูล สมาชิก ช่องทางโซเชียล และคีย์ API ของแต่ละบริษัทหรือแบรนด์เป็นอิสระต่อกันอย่างปลอดภัย 100%",
  },
  {
    icon: "sparkles" as const,
    title: "3-in-1 Adaptive Text Engine",
    body: "ป้อนบรีฟสั้นเพียงครั้งเดียว AI สร้างเนื้อหาพร้อมกัน 3 สไตล์: บทความยาว (Long-form), แคปชันสั้น (Social), และโครงสร้างโฆษณา (AIDA)",
  },
  {
    icon: "zap" as const,
    title: "Auto-Pilot Cron Engine",
    body: "ระบบคิวงานอัจฉริยะที่จะตรวจจับโพสต์และยิงเข้าสู่ Facebook และ Instagram ตามวันเวลาที่ตั้งไว้อัตโนมัติ",
  },
];

export const ACTION_ROUTES = [
  {
    badge: "⚡ Route A (ด่วนที่สุด)",
    title: "🚀 เผยแพร่ทันที / ตั้งเวลา Auto-Post",
    body: "คลิกเดียวเปิดหน้าต่างพรีวิวฟีดจำลอง ติ๊กเลือกเพจ Facebook/IG แล้วเลือก \"โพสต์ทันที\" หรือ \"ตั้งเวลา\" เข้าคิว Auto-Publisher ทันที",
    fit: "✓ เหมาะสำหรับ: โพสต์ประจำวัน, ข่าวด่วน",
    tone: "neu-tint-primary border-primary/25",
    badgeClass: "bg-primary/15 text-primary border-primary/25",
    fitClass: "text-primary",
  },
  {
    badge: "💾 Route B (สายตุนสต็อก)",
    title: "บันทึกเป็นแบบร่าง (Save Draft)",
    body: "เก็บเข้าคลังแบบร่างรอโพสต์ (Drafts Queue) โดยยังไม่ต้องระบุวันเวลา ช่วยให้ครีเอเตอร์ทำคอนเทนต์ตุนไว้ 10-30 ชิ้นในวันเดียว",
    fit: "✓ เหมาะสำหรับ: Batch Content Production",
    tone: "neu-tint-teal border-teal-500/25",
    badgeClass: "bg-teal-500/15 text-teal-600 dark:text-teal-300 border-teal-500/25",
    fitClass: "text-teal-600 dark:text-teal-300",
  },
  {
    badge: "⚙️ Route C (ละเอียดสูงสุด)",
    title: "เปิดใน AI Publisher (ขั้นสูง)",
    body: "ส่งต่อเนื้อหาด้วย Session Bridge ไปยัง 4-Step Wizard เพื่อปรับข้อความแยกตามเพจ และตรวจสอบพรีวิวแยกอุปกรณ์",
    fit: "✓ เหมาะสำหรับ: แคมเปญการตลาดขนาดใหญ่",
    tone: "neu-pressed border-[var(--hairline-border)]",
    badgeClass: "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/25",
    fitClass: "text-violet-600 dark:text-violet-300",
  },
];

export const DRAFT_ACTIONS = [
  {
    title: "🚀 ปุ่ม [ ตั้งค่า & สั่งโพสต์ ]",
    desc: "ดึงแคปชันและสื่อเปิด Modal ทันที เลือกเพจและวันเวลา แล้วส่งเข้าคิว Auto-Post ได้เลย",
    tag: "1-Click Action",
    tagClass: "bg-primary/15 text-primary border border-primary/25",
  },
  {
    title: "✏️ ปุ่ม [ แก้ไข ]",
    desc: "เปิดกลับเข้าไปยังตัวปรับแต่ง เพื่อแก้ไขคำหรือปรับเปลี่ยนรูปภาพ",
    tag: "Edit",
    tagClass: "neu-raised text-foreground/80 border border-[var(--hairline-border)]",
  },
  {
    title: "🗑️ ปุ่ม [ ลบ ]",
    desc: "ย้ายแบบร่างที่ไม่ใช้งานลงถังขยะ สามารถกู้คืนได้ที่หน้า Trash",
    tag: "Soft Delete",
    tagClass: "bg-destructive/15 text-destructive border border-destructive/25",
  },
];

export const POST_LIFECYCLE = [
  { label: "🟡 SCHEDULED:", desc: "อยู่ในคิวรอ Cron ดึงไปเผยแพร่", tone: "text-amber-600 dark:text-amber-400" },
  { label: "🔵 PUBLISHING:", desc: "กำลังนำส่งข้อมูลไปยัง Graph API", tone: "text-primary" },
  { label: "🟢 PUBLISHED:", desc: "โพสต์สำเร็จขึ้นสู่ฟีดเรียบร้อย", tone: "text-teal-600 dark:text-teal-400" },
  { label: "🔴 FAILED:", desc: "การส่งไม่สำเร็จ พร้อม Error Message", tone: "text-destructive" },
];

export const TROUBLESHOOTING_ROWS = [
  {
    issue: "สั่งสร้างภาพหรือคลิปวิดีโอแล้วหมุนค้าง",
    cause: "คีย์ API ไม่ถูกต้อง วงเงินหมด หรือเครือข่าย AI มีปัญหา",
    fix: "ไปที่หน้า Settings ตรวจเช็ก Badge และทดสอบอัปเดตคีย์ใหม่",
  },
  {
    issue: "ภาพที่ได้เป็นภาพสต็อกทั่วไป",
    cause: "เป็นระบบ Fallback ทำงานเมื่อระบบฟรีชนลิมิต IP",
    fix: "แนะนำให้ระบุคีย์ Google Gemini ใน Settings เพื่อให้ได้ภาพ AI แท้เสมอ",
  },
  {
    issue: "โพสต์ขึ้นสถานะ FAILED",
    cause: "Token การเชื่อมต่อเพจ Facebook/Instagram หมดอายุ",
    fix: "ไปที่หน้า Integrations แล้วกด Reconnect เพจเพื่อต่ออายุ Token",
  },
];
