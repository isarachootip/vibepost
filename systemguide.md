# คู่มือระบบ BizNext Content Auto-Post System (System Guide)

เอกสารฉบับนี้เป็นคู่มือรายละเอียดเกี่ยวกับสถาปัตยกรรม ฟังก์ชันการทำงาน (Functional Specifications) โครงสร้างฐานข้อมูล และวิธีการตั้งค่าเครื่องมือ AI ภายในระบบ **BizNext** เพื่อเป็นแหล่งข้อมูลอ้างอิงหลัก (Single Source of Truth) ของนักพัฒนาและผู้ดูแลระบบ

---

## 📂 1. ภาพรวมระบบและโมดูลการทำงาน (System Modules)

ระบบ BizNext แบ่งพื้นที่การทำงานออกเป็น **Workspace** ที่เป็นอิสระต่อกัน (Isolated) โดยในแต่ละพื้นที่ทำงานประกอบด้วย 4 โมดูลหลัก ดังนี้:

### 1.1 AI Studio (ห้องสร้างสรรค์เนื้อหา)
* **One-Click 3 Formats**: เจเนอเรตข้อความ 3 รูปแบบพร้อมกันในคลิกเดียว:
  1. *บทความยาว (Long-form)* - สำหรับบล็อกหรือเว็บไซต์ทางการ
  2. *แคปชันสั้น (Social Caption)* - สำหรับ Facebook / Instagram พร้อม Emojis
  3. *เชิงโฆษณา (Marketing AIDA)* - เขียนเนื้อหาตามหลัก Attention, Interest, Desire, Action
* **Inline Editor & Switcher**: แสดงแถบสลับเนื้อหา (Tab selectors) ให้ผู้ใช้สามารถคลิกเลือกรูปแบบ และแก้ไขข้อความในกล่อง Textarea ได้โดยตรงและบันทึกแยกกันแบบอิสระ
* **Ask-to-Copy Prompt**: เมื่อสร้างเนื้อหาเสร็จแล้ว กดปุ่มสร้างภาพ/วิดีโอ ระบบจะมี Dialog ถามเพื่อดึงสรุปใจความสำคัญไปตั้งเป็น Prompt เริ่มต้นทันที

### 1.2 AI Content Publisher (ศูนย์จัดการและเผยแพร่)
* **Single / Video / Multi-Post Wizards**: วิซาร์ดทีละขั้นตอน (Step-by-step) สำหรับการส่งโพสต์ไปยังเครือข่ายโซเชียล
* **Schedule & Post Now**: ตั้งเวลาโพสต์ในอนาคต (โดยระบุวันที่ และเวลา ชั่วโมง:นาที) หรือสั่งโพสต์ทันที
* **Social Connections**: ยิง Payload ตรงเข้า Facebook Page API หรือช่องทางอื่นๆ ที่เชื่อมต่อไว้ผ่านระบบ OAuth

### 1.3 Post Monitor & History (ระบบติดตามสถานะ)
* ติดตามสถานะของโพสต์ในวงจรอายุโพสต์ (Post Lifecycle):
  - `DRAFT` (ร่างเนื้อหา)
  - `SCHEDULED` (รอคิวโพสต์อัตโนมัติ)
  - `PUBLISHED` (โพสต์สำเร็จแล้ว)
  - `FAILED` (โพสต์ไม่สำเร็จ พร้อมบันทึกข้อความ Error จาก API ปลายทาง)

---

## 🤖 2. ระบบโมดูล AI Visual & Video Studio

ระบบประกอบด้วยฟังก์ชันสร้างรูปภาพประกอบและคลิปวิดีโอผ่าน API ของผู้ให้บริการชั้นนำ:

### 2.1 AI Image Creator (การสร้างรูปภาพ)
* **Gemini Imagen 3/4.0 Fast**: เรียกใช้โมเดลล่าสุดของ Google ผ่าน endpoint `predict` ด้วยความเร็วสูงและคุณภาพดีเยี่ยม (ต้องการคีย์ Gemini ใน Settings)
* **Auto-Upgrade**: หากผู้ใช้เลือกแบบฟรี แต่ระบบพบว่ามีคีย์ Gemini พร้อมใช้งานใน Workspace ระบบจะอัปเกรดมาสร้างรูปด้วย Gemini Imagen อัตโนมัติเพื่อผลลัพธ์ที่ดีที่สุด
* **Fail-Safe Fallbacks**:
  - หากระบบฟรีตัวหลัก (Pollinations.ai) ติดปัญหาคิวเต็มหรือชนขีดจำกัด IP ของ Hostinger VPS ระบบจะสลับไปตัดเอาคำสำคัญ (Tags) และดาวน์โหลดภาพสต็อกสวยๆ จาก **LoremFlickr** มาทดแทนให้โดยอัตโนมัติ ป้องกันการแสดงผลลัพธ์ล้มเหลว
* **Prompt Builder**: กล่องกรอกข้อมูลที่แยกองค์ประกอบภาพ 4 ส่วน (วัตถุหลัก, ฉากหลัง, แสง/สไตล์, มุมกล้อง) และรวมเข้าเป็น Prompt สมบูรณ์ตามหลัก Prompt Engineering

### 2.2 AI Video Studio (การเจเนอเรตวิดีโอ)
* **Luma Dream Machine**: ยิงคำสั่งสร้างวิดีโอ (Text-to-Video) ไปยัง API ของ Luma และวนลูปตรวจสอบ (Polling) สถานะจนกระทั่งเป็น `completed` เพื่อนำลิงก์ไฟล์วิดีโอมารันต่อ
* **Kling AI Video**: สร้าง JWT signature ด้วย `AccessKey` และ `SecretKey` ในฝั่งหลังบ้าน ยิงคำสั่งสร้างวิดีโอแบบ Asynchronous ไปยังเซิร์ฟเวอร์สิงคโปร์ของ Kling และ Polling ทุกๆ 5 วินาทีจนสำเร็จ
* **Curated Stock Fallback**: หากไม่มีการใส่คีย์ Luma หรือ Kling หรือการเจนด้วย AI เกิดข้อผิดพลาด ระบบจะทำการดึงไฟล์วิดีโอสต็อกคุณภาพเยี่ยมจากฐานข้อมูล Pexels ที่เราคัดเลือกไว้ (Curated Videos) เพื่อเป็น UX สำรองให้ทันที

---

## 💾 3. โครงสร้างฐานข้อมูล (Prisma PostgreSQL)

ฐานข้อมูลหลักถูกจัดการผ่าน **Prisma ORM** โดยมีตารางที่สำคัญในการตั้งค่า AI และเก็บบันทึกการใช้งานดังนี้:

### 3.1 ตาราง PromptConfig (การตั้งค่า API Keys)
ทำหน้าที่เก็บคีย์ API ของผู้ให้บริการแต่ละรายแยกตาม Workspace:
```prisma
model PromptConfig {
  id          String    @id @default(cuid())
  workspaceId String
  provider    AIProvider
  apiKey      String    // เข้ารหัสลับผ่าน backend ก่อนบันทึก
  isActive    Boolean   @default(true)
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum AIProvider {
  OPENROUTER
  OPENAI
  CLAUDE
  GEMINI
  KIMI
  KLING
  LUMA
}
```

### 3.2 ตาราง AIUsageLog (ประวัติสะสมการใช้งานและ Token)
ทำหน้าที่เก็บบันทึกข้อมูลเหรียญและประเมินค่าใช้จ่ายดอลลาร์ตามจริงสำหรับใช้งานแดชบอร์ดสรุป:
```prisma
model AIUsageLog {
  id               String      @id @default(cuid())
  workspaceId      String
  actionType       String      // "ARTICLE" | "IMAGE" | "VIDEO"
  provider         String      // "GEMINI" | "KIMI" | "KLING" | "LUMA" | "OPENAI" | "FREE"
  modelName        String?     // เช่น "gemini-2.5-flash", "moonshot-v1-8k", "kling-v2-6"
  promptTokens     Int         @default(0)
  completionTokens Int         @default(0)
  totalTokens      Int         @default(0)
  estimatedCost    Float       @default(0.0) // ประเมินต้นทุนรวมเป็นเงิน USD
  workspace        Workspace   @relation(fields: [workspaceId], references: [id])
  createdAt        DateTime    @default(now())
}
```

---

## ⚙️ 4. กฎการกรอกคีย์และความปลอดภัยในหน้า Settings

เพื่อให้อินเตอร์เฟซใช้งานง่าย หน้าจอ Settings ได้ถูกออกแบบใหม่ให้แบ่งกลุ่มการทำงานและแสดงหน้าจอสรุป (Configuration Summary) ด้านบนสุด:

1. **Workspace Summary**: แสดง Badge ให้เห็นทันทีว่าขณะนี้ใน Workspace มีสมองกล AI ตัวใดรันการเขียนบทความ (Text), สร้างรูปภาพ (Image) และผลิตคลิปวิดีโอ (Video) อยู่
2. **Kimi (Moonshot AI)**: นำคีย์ API มากรอกในช่อง Kimi AI เพื่อต่อคอลล์ตรงกับเซิร์ฟเวอร์จีนโดยตรง
3. **Kling AI (คีย์คู่)**: เนื่องจาก Kling AI ต้องใช้รหัสสองชุด (Access Key และ Secret Key) ในช่องกรอก API Key ผู้ใช้งานจะต้องป้อนในรูปแบบ **`AccessKey:SecretKey`** (คั่นด้วยเครื่องหมาย colon เช่น `ak_12345:sk_67890`) ซึ่งระบบหลังบ้านจะดึงข้อมูลมาแยกและสร้าง JWT Signed Token ให้โดยอัตโนมัติ

---

## 📦 5. คู่มือการ Deploy บนเซิร์ฟเวอร์ Hostinger VPS (ด้วย Coolify)

ระบบนี้โฮสต์อยู่บน Hostinger Cloud VPS บริหารจัดการผ่าน **Coolify** โดยมีแนวทางปฏิบัติทางเทคนิคเมื่อมีการปรับปรุงซอร์สโค้ดดังนี้:

1. **ดีพลอยโค้ดใหม่**:
   เมื่อพุชโค้ดเข้า GitHub (สาขา `main`) ระบบ Coolify จะตรวจจับ Webhook และเริ่มกระบวนการ Build อัตโนมัติ
2. **การซิงก์ Schema ฐานข้อมูล (Bypass prisma config load error)**:
   ใน Next.js Production Container จะไม่มีตัวแปร `dotenv` สำหรับเรียกใช้ไฟล์ `prisma.config.ts` ทำให้เมื่อรันคำสั่ง `npx prisma db push` บนคอนเทนเนอร์จริงมักจะติดข้อผิดพลาด เพื่อแก้ปัญหานี้ให้ทำตามขั้นตอนนี้:
   - เข้าผ่าน SSH และทำการติดตั้ง `dotenv` ชั่วคราวใน container:
     ```bash
     docker exec -u root <container-name> npm install --no-save dotenv
     ```
   - จากนั้นจึงรันคำสั่ง push เพื่อซิงก์ Schema เข้าสู่ฐานข้อมูลจริง:
     ```bash
     docker exec -u root <container-name> npx prisma db push
     ```
