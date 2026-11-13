export type FAQCategory = "all" | "workflow" | "text" | "image" | "video" | "security";

export interface FAQItem {
  question: string;
  answer: string;
  category: Exclude<FAQCategory, "all">;
  keywords: string[];
}

export const FAQ_CATEGORIES: { id: FAQCategory; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "workflow", label: "🔄 กระบวนการโพสต์ (Workflow & Auto-Post)" },
  { id: "text", label: "✍️ การเขียนบทความ (Text AI)" },
  { id: "image", label: "🎨 ระบบรูปภาพ (Image AI)" },
  { id: "video", label: "🎬 ระบบวิดีโอ (Video AI)" },
  { id: "security", label: "🔒 ความปลอดภัย & คีย์" },
];

export const FAQ_CATEGORY_STYLES: Record<
  Exclude<FAQCategory, "all">,
  { label: string; badgeClass: string }
> = {
  workflow: {
    label: "Workflow",
    badgeClass: "bg-teal-500/12 text-teal-600 dark:text-teal-300 border border-teal-500/25",
  },
  video: {
    label: "Video AI",
    badgeClass: "bg-sky-500/12 text-sky-600 dark:text-sky-300 border border-sky-500/25",
  },
  image: {
    label: "Image AI",
    badgeClass: "bg-violet-500/12 text-violet-600 dark:text-violet-300 border border-violet-500/25",
  },
  text: {
    label: "Text AI",
    badgeClass: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25",
  },
  security: {
    label: "Security",
    badgeClass: "bg-amber-500/12 text-amber-600 dark:text-amber-300 border border-amber-500/25",
  },
};

export const FAQ_DATA: FAQItem[] = [
  {
    category: "workflow",
    question: "กระบวนการทำงานภาพรวม (End-to-End Process) จาก AI Studio สู่ Auto-Post ทำงานอย่างไร?",
    answer:
      "ระบบออกแบบมาเพื่อรองรับ 2 โหมดการทำงานหลักตามสไตล์ครีเอเตอร์:\n\n1. **โหมด Fast-Track (ทำเสร็จปุ๊บ สั่งโพสต์ปั๊บ)**:\n   เมื่อคุณสร้างแคปชันและรูปภาพ/วิดีโอใน **AI Studio** เสร็จแล้ว สามารถกดปุ่ม **'🚀 เผยแพร่ทันที / ตั้งเวลา Auto-Post'** เพื่อเปิดหน้าต่างเลือกเพจ Facebook/Instagram และกำหนดวัน-เวลา แล้วกดยืนยันเพื่อนำเข้าคิว Auto-Post ได้ทันทีในคลิกเดียว\n\n2. **โหมด Batch Production (ทำตุนไว้ในสต็อก แล้วค่อยทยอยโพสต์)**:\n   เมื่อเจนคอนเทนต์เสร็จ ให้กดปุ่ม **'💾 บันทึกเป็นแบบร่าง (Draft)'** เพื่อเก็บเข้า **'คลังแบบร่างรอโพสต์ (Drafts Queue)'** จากนั้นสามารถเข้าไปที่หน้า **Post History -> คลังแบบร่างรอโพสต์** เพื่อดูรายการทั้งหมด แล้วคลิกปุ่ม **'🚀 ตั้งค่า & สั่งโพสต์'** ทีละโพสต์ตามแผนการตลาด",
    keywords: ["workflow", "process", "autopost", "ขั้นตอน", "การทำงาน", "กระบวนการ", "สตูดิโอ", "ai studio", "draft", "คลังแบบร่าง"],
  },
  {
    category: "workflow",
    question: "ปุ่ม 'บันทึกเป็นแบบร่าง (Save Draft)' กับ 'เผยแพร่ทันที / ตั้งเวลา Auto-Post' ต่างกันอย่างไร?",
    answer:
      "- **💾 บันทึกเป็นแบบร่าง (Save Draft)**: จัดเก็บข้อความแคปชันและไฟล์รูปภาพ/วิดีโอ AI ลงในฐานข้อมูลสถานะ `DRAFT` โดยยังไม่ผูกกับวันเวลาโพสต์ เหมาะสำหรับการผลิตคอนเทนต์ตุนไว้หลายๆ ชิ้นในคราวเดียว\n- **🚀 เผยแพร่ทันที / ตั้งเวลา Auto-Post (Instant Publisher)**: เชื่อมโยงคอนเทนต์เข้ากับเพจโซเชียลมีเดียที่เลือก พร้อมกำหนดเวลา (Schedule) หรือโพสต์ทันที (Post Now) และส่งเข้าสู่ระบบ Auto-Publisher Cron โดยตรง",
    keywords: ["draft", "save", "บันทึก", "แบบร่าง", "ต่างกัน", "autopost", "instant", "เผยแพร่ทันที"],
  },
  {
    category: "workflow",
    question: "หน้ารวมคลังแบบร่างรอโพสต์ (Drafts Queue) อยู่ที่ไหน และใช้งานอย่างไร?",
    answer:
      "คุณสามารถเข้าใช้งานได้ที่เมนู **Post History (ประวัติโพสต์ & คลังเนื้อหา)** -> เลือกแท็บ **'📝 คลังแบบร่างรอโพสต์ (Drafts Queue)'**:\n\n- แสดงการ์ดของทุกคอนเทนต์ที่ทำตุนไว้ พร้อม Thumbnail รูปภาพ/วิดีโอ และข้อความแคปชัน\n- กดปุ่ม **'🚀 ตั้งค่า & สั่งโพสต์'** บนการ์ดใดก็ได้ เพื่อเปิดหน้าต่างเลือกเพจและตั้งเวลาปล่อยโพสต์ได้ทันที\n- กดปุ่ม **'✏️ แก้ไข'** เพื่อเปิดปรับแต่งแบบละเอียดใน AI Content Publisher\n- กดปุ่ม **'🗑️ ลบ'** เพื่อย้ายแบบร่างที่ไม่ใช้งานลงถังขยะ",
    keywords: ["คลังแบบร่าง", "drafts queue", "หน้ารวม", "รอโพสต์", "post history", "จัดการโพสต์"],
  },
  {
    category: "video",
    question: "ระบบ BizNext จัดลำดับความสำคัญของค่าย AI ในการสร้างวิดีโออย่างไร?",
    answer:
      "ระบบมีกลไกตรวจสอบลำดับความสำคัญในการเรนเดอร์วิดีโอ (Cascade Logic) ดังนี้:\n\n1. **Google Veo 2.0 (Gemini)**: ทำงานเป็นอันดับแรกหากมีคีย์ Google Gemini\n2. **Luma Dream Machine**: ทำงานเป็นลำดับที่สองหากมีคีย์ Luma และคีย์ Gemini ไม่ได้ใช้งานหรือเกิดข้อผิดพลาด\n3. **Kling AI**: ทำงานเป็นลำดับที่สามหากมีคีย์ Kling\n4. **Curated Videos (Pexels)**: หากไม่มีคีย์ของค่ายใดเลย หรือการสร้างจาก AI ทั้งหมดล้มเหลว ระบบจะดึงไฟล์วิดีโอสต็อกคุณภาพสูงที่เราคัดสรรไว้มาแสดงผลเป็น Fallback ทันที เพื่อป้องกันโพสต์ขาดสื่อประกอบ",
    keywords: ["วิดีโอ", "veo", "luma", "kling", "pexels", "fallback", "video", "ลำดับ"],
  },
  {
    category: "video",
    question: "วิธีการตั้งค่าใช้งาน Google Veo และ Gemini (Nano Banana) ต้องใช้ API Key อะไรบ้าง?",
    answer:
      "สะดวกมาก! คุณใช้เพียง **Google Gemini API Key** ชุดเดียวจาก [Google AI Studio](https://aistudio.google.com/) จากนั้นนำมากรอกในหน้า **Settings -> Google Gemini** ระบบจะนำคีย์นี้ไปประมวลผลร่วมกันทั้งหมด ครอบคลุมการเขียนสคริปต์ (Gemini), การเจนรูปต้นแบบ/Character Seed (Imagen 4.0 Fast) และการสร้างวิดีโอเคลื่อนไหว (Google Veo)",
    keywords: ["veo", "gemini", "banana", "key", "settings", "api", "studio", "ตั้งค่า"],
  },
  {
    category: "image",
    question: "ระบบสร้างรูปภาพ 'Nano Banana' (Imagen) ทำงานร่วมกับโมดูลวิดีโออย่างไร?",
    answer:
      "ในห้องสร้างสรรค์เนื้อหา (AI Studio) คุณสามารถเจนรูปภาพคีย์เฟรมด้วย Gemini Imagen 4.0 ได้ทันที จากนั้นรูปภาพที่สร้างสำเร็จ (MediaAsset) จะถูกใช้เป็น **Image Reference** หรือ **Character Seed** เพื่อส่งต่อให้ AI Video (เช่น Luma, Kling หรือ Veo) นำไปเรนเดอร์เป็นภาพเคลื่อนไหวที่ควบคุมความสม่ำเสมอของสไตล์ตัวละครหรือโทนสีได้เป็นอย่างดี",
    keywords: ["ภาพ", "รูป", "imagen", "reference", "seed", "character", "สไตล์", "คุมโทน"],
  },
  {
    category: "image",
    question: "ระบบสำรองรูปภาพสต็อก (Image Fallback) จะทำงานตอนไหน?",
    answer:
      "เมื่อระบบประมวลผลการเจนภาพด้วย AI แบบฟรี (Pollinations.ai) หรือ API เกิดปัญหาคิวเต็ม หรือชนขีดจำกัด IP ของเซิร์ฟเวอร์ VPS ระบบจะใช้กลไก Fail-safe อัตโนมัติ โดยการถอดคำสำคัญ (Tags) ออกมาจาก Prompt แล้วไปดาวน์โหลดภาพสต็อกทดแทนจาก **LoremFlickr** มาใช้งานให้ทันที เพื่อให้โพสต์สามารถทำงานต่อได้โดยไม่ล้มเหลว",
    keywords: ["ภาพ", "สต็อก", "loremflickr", "pollinations", "fallback", "รูป", "ฟรี"],
  },
  {
    category: "security",
    question: "วิธีใส่คีย์ Kling AI แบบสองคีย์ (AccessKey:SecretKey) ต้องกรอกอย่างไร?",
    answer:
      "เนื่องจาก Kling AI ต้องการ API Key สองรหัสคู่กัน ให้คุณกรอกในช่อง Kling API Key โดยใช้เครื่องหมายโคลอน `:` คั่นระหว่างคีย์ ตัวอย่างเช่น: `AccessKey_ตัวอย่าง:SecretKey_ตัวอย่าง` ระบบหลังบ้านจะแยกคีย์และนำไปสร้าง JWT Token เพื่อตรวจสอบสิทธิ์การใช้งานให้อัตโนมัติ",
    keywords: ["kling", "key", "secret", "access", "โคลอน", "คั่น", "settings"],
  },
  {
    category: "security",
    question: "คีย์ API ที่ใส่ลงไปในหน้า Settings มีความปลอดภัยอย่างไร?",
    answer:
      "คีย์ API ทั้งหมดที่ถูกกรอกจะถูกส่งผ่านโปรโตคอล HTTPS ที่ปลอดภัย และจะถูก**เข้ารหัสลับในฝั่งหลังบ้าน (Backend Server-side Encryption)** ก่อนนำไปจัดเก็บลงในฐานข้อมูล PostgreSQL เพื่อรับประกันความปลอดภัยของบัญชีผู้ใช้อย่างสูงสุด",
    keywords: ["ความปลอดภัย", "security", "encrypt", "คีย์", "settings", "api", "ปลอดภัย"],
  },
  {
    category: "text",
    question: "ระบบ One-Click 3 Formats ในห้อง AI Studio ทำงานอย่างไร?",
    answer:
      "เมื่อคุณกรอกหัวข้อและกดปุ่มสร้าง ระบบจะส่งคำสั่งไปยังโมเดลภาษาขนาดใหญ่ (เช่น Gemini หรือ Kimi) เพื่อสร้างเนื้อหา 3 รูปแบบพร้อมกันในคลิกเดียว ได้แก่:\n\n1. **Long-form**: บทความยาวสำหรับบล็อก\n2. **Social Caption**: ข้อความสั้นมีอีโมจิสำหรับ Facebook/Instagram\n3. **Marketing AIDA**: ข้อความโฆษณาตามหลัก Attention, Interest, Desire, Action\n\nผู้ใช้สามารถสลับอ่าน ปรับแก้ และกดบันทึกหรือกดแชร์แยกโพสต์กันได้อย่างเป็นอิสระ",
    keywords: ["text", "เขียน", "บทความ", "aida", "caption", "3 formats", "studio", "long-form"],
  },
];
