import { Layers, Share2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { ACTION_ROUTES, OVERVIEW_PILLARS } from "./manual-data";

export function ManualSectionHeading({
  stepNumber,
  title,
  subtitle,
  accentSolid = false,
}: {
  stepNumber: number;
  title: string;
  subtitle: string;
  accentSolid?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--hairline-border)] pb-4">
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold shrink-0 ${
          accentSolid
            ? "bg-primary text-white shadow-md shadow-primary/25"
            : "neu-tint-primary text-primary border border-primary/25"
        }`}
      >
        {stepNumber}
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function ManualCoreSections({ shouldShow }: { shouldShow: (id: string) => boolean }) {
  return (
    <>
      {/* Section 1: Overview */}
      {shouldShow("overview") && (
        <article className="neu-raised neu-grain rounded-3xl p-6 md:p-8 space-y-6">
          <ManualSectionHeading
            stepNumber={1}
            title="ภาพรวมระบบและสถาปัตยกรรม (System Overview)"
            subtitle="สถาปัตยกรรม Multi-Workspace และขุมพลัง Auto-Pilot"
          />

          <p className="text-sm leading-relaxed text-foreground/85">
            <strong>VibePost</strong> ถูกออกแบบขึ้นเพื่อให้ธุรกิจสามารถผลิตและกระจายคอนเทนต์ไปยังโซเชียลมีเดียได้อย่างรวดเร็ว แม่นยำ และประหยัดเวลา โดยผสาน AI ชั้นนำของโลกเข้าด้วยกัน ไม่ว่าจะเป็น Google Gemini (Text &amp; Imagen), Google Veo, Luma Dream Machine, และ Kling AI ภายใต้ระบบรักษาความปลอดภัยที่แยก Workspace ของแต่ละแบรนด์อย่างเด็ดขาด
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {OVERVIEW_PILLARS.map((item) => {
              const Icon = item.icon === "layers" ? Layers : item.icon === "sparkles" ? Sparkles : Zap;
              return (
                <div
                  key={item.title}
                  className="p-4 rounded-2xl neu-pressed border border-[var(--hairline-border)] space-y-2"
                >
                  <div className="flex items-center gap-2 text-primary font-bold text-xs">
                    <Icon className="size-4" /> {item.title}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl neu-tint-primary border border-primary/25 text-xs text-foreground/90 leading-relaxed">
            💡 <strong>คำแนะนำสำหรับ Trainer:</strong> เน้นย้ำให้ผู้เข้ารับการอบรมทราบว่าระบบมี Fallback Protection ทั้งรูปภาพและวิดีโอ แม้ว่าโควตา API หรือเครือข่ายจะมีปัญหา ระบบจะดึงภาพสต็อกสวยงามมาใส่ให้ทันทีเพื่อไม่ให้ขั้นตอนการโพสต์สะดุด
          </div>
        </article>
      )}

      {/* Section 2: Setup & Integrations */}
      {shouldShow("setup") && (
        <article className="neu-raised neu-grain rounded-3xl p-6 md:p-8 space-y-6">
          <ManualSectionHeading
            stepNumber={2}
            title="การตั้งค่าบัญชีและการเชื่อมต่อ (Workspace & Setup)"
            subtitle="การผูกเพจโซเชียลมีเดียและการใส่คีย์สมองกล AI"
          />

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Share2 className="size-4 text-primary" />
              การเชื่อมต่อเพจ Facebook และ Instagram
            </h3>
            <ol className="list-decimal list-inside text-xs space-y-2 text-muted-foreground ml-1 leading-relaxed">
              <li>ไปที่เมนู <strong className="text-foreground">Integrations</strong> ในแถบด้านซ้าย</li>
              <li>คลิกปุ่ม <strong className="text-primary">&quot;เชื่อมต่อ Facebook / Instagram&quot;</strong></li>
              <li>เข้าสู่ระบบบัญชี Facebook ของท่าน และเลือกเพจธุรกิจที่ต้องการมอบหมายให้ VibePost ดูแล</li>
              <li>อนุญาตสิทธิ์การจัดการเพจและการเผยแพร่เนื้อหา จากนั้นกดยืนยัน</li>
              <li>ตรวจเช็กสถานะการ์ดเพจในหน้าเว็บให้ขึ้นสัญลักษณ์สีเขียว <strong className="text-teal-500">&quot;Active&quot;</strong></li>
            </ol>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              การตั้งค่าคีย์ปัญญาประดิษฐ์ (AI API Keys) ในหน้า Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-[var(--hairline-border)] neu-pressed space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  🤖 Google Gemini (แนะนำสูงสุด)
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  ใช้คีย์เดียวจาก Google AI Studio สามารถปลดล็อกได้ครบ 3 โมดูล: Gemini 2.5 Flash สำหรับเขียนสคริปต์, Imagen 4.0 Fast สำหรับวาดรูป, และ Google Veo 2.0 สำหรับสร้างคลิปวิดีโอ
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--hairline-border)] neu-pressed space-y-2">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  🎬 Kling AI Video (คีย์คู่)
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  จำเป็นต้องระบุคีย์ในรูปแบบ <code className="neu-raised px-1.5 py-0.5 rounded text-primary font-mono border border-[var(--hairline-border)]">AccessKey:SecretKey</code> (คั่นด้วยโคลอน เช่น ak_xxx:sk_xxx) ระบบหลังบ้านจะสร้าง JWT Token ให้อัตโนมัติ
                </p>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Section 3: AI Studio */}
      {shouldShow("studio") && (
        <article className="neu-raised neu-grain rounded-3xl p-6 md:p-8 space-y-6">
          <ManualSectionHeading
            stepNumber={3}
            title="การสร้างสรรค์เนื้อหาใน AI Studio (`/dashboard/ai-studio`)"
            subtitle="ห้องปฏิบัติการสร้างแคปชัน 3 สไตล์, ภาพประกอบ และวิดีโอเคลื่อนไหว"
          />

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">
              ขั้นตอนการปฏิบัติงานใน AI Studio:
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex gap-3 p-3.5 rounded-2xl neu-pressed border border-[var(--hairline-border)]">
                <span className="font-bold text-primary shrink-0">ขั้นตอนที่ 1:</span>
                <div>
                  พิมพ์หัวข้อสั้น ๆ เช่น <em>&quot;แนะนำฟีเจอร์ใหม่ VibePost ระบบ Auto-Post โซเชียลมีเดียด้วย AI ช่วยประหยัดเวลา 80%&quot;</em> แล้วคลิกปุ่ม <strong className="text-foreground">&quot;✨ สร้างเนื้อหา 3 สไตล์&quot;</strong>
                </div>
              </div>

              <div className="flex gap-3 p-3.5 rounded-2xl neu-pressed border border-[var(--hairline-border)]">
                <span className="font-bold text-primary shrink-0">ขั้นตอนที่ 2:</span>
                <div>
                  คลิกสลับแท็บเพื่อตรวจสอบแคปชัน:
                  <ul className="list-disc list-inside mt-1 space-y-1 text-muted-foreground">
                    <li><strong className="text-foreground">Long-form:</strong> เหมาะสำหรับบทความให้ความรู้ รายละเอียดยาว</li>
                    <li><strong className="text-foreground">Social Caption:</strong> เหมาะกับ Facebook &amp; IG อ่านง่าย กระชับ มีอีโมจิ</li>
                    <li><strong className="text-foreground">Marketing AIDA:</strong> โครงสร้างเพื่อการขาย (ดึงดูด ➔ สนใจ ➔ อยากได้ ➔ สั่งซื้อ)</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 p-3.5 rounded-2xl neu-pressed border border-[var(--hairline-border)]">
                <span className="font-bold text-primary shrink-0">ขั้นตอนที่ 3:</span>
                <div>
                  เลื่อนลงมาที่ส่วน <strong className="text-foreground">สร้างรูปภาพ (AI Visual)</strong> หรือ <strong className="text-foreground">สร้างวิดีโอ (Video Studio)</strong> คลิกปุ่ม <em>&quot;ดึงบรีฟจากแคปชัน&quot;</em> แล้วกดสั่งสร้าง ระบบจะดึง Imagen 4.0 Fast หรือ Google Veo / Luma มาสร้างสื่อทันที
                </div>
              </div>
            </div>
          </div>
        </article>
      )}

      {/* Section 4: 3 Action Routes */}
      {shouldShow("routes") && (
        <article className="neu-raised neu-grain rounded-3xl p-6 md:p-8 space-y-6">
          <ManualSectionHeading
            stepNumber={4}
            title="3 เส้นทางในการเผยแพร่คอนเทนต์ (Action Routes)"
            subtitle="เลือกวิธีการส่งออกตามเป้าหมายของแคมเปญ"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACTION_ROUTES.map((route) => (
              <div key={route.badge} className={`p-5 rounded-2xl border space-y-3 ${route.tone}`}>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${route.badgeClass}`}>
                  {route.badge}
                </div>
                <h3 className="text-sm font-bold text-foreground">{route.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{route.body}</p>
                <div className={`text-[11px] font-semibold ${route.fitClass}`}>{route.fit}</div>
              </div>
            ))}
          </div>
        </article>
      )}
    </>
  );
}
