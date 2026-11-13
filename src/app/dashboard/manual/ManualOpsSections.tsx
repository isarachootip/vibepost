import { Clock, Coins, Download, ExternalLink } from "lucide-react";
import { DRAFT_ACTIONS, POST_LIFECYCLE, TROUBLESHOOTING_ROWS } from "./manual-data";
import { ManualSectionHeading } from "./ManualCoreSections";

export function ManualOpsSections({ shouldShow }: { shouldShow: (id: string) => boolean }) {
  return (
    <>
      {/* Section 5: Drafts Queue */}
      {shouldShow("drafts") && (
        <article className="neu-raised neu-grain rounded-3xl p-6 md:p-8 space-y-6">
          <ManualSectionHeading
            stepNumber={5}
            title="การบริหารจัดการคลังแบบร่างรอโพสต์ (Drafts Queue)"
            subtitle="ศูนย์รวมคอนเทนต์ที่เตรียมไว้ในหน้า `/dashboard/history`"
          />

          <p className="text-xs text-muted-foreground leading-relaxed">
            เมื่อเข้าไปที่เมนู <strong className="text-foreground">Post History</strong> และเลือกแท็บ <strong className="text-primary">&quot;📝 คลังแบบร่างรอโพสต์ (Drafts Queue)&quot;</strong> ท่านจะพบกับการ์ดคอนเทนต์ที่สร้างตุนไว้:
          </p>

          <div className="space-y-3">
            {DRAFT_ACTIONS.map((action) => (
              <div
                key={action.title}
                className="p-3.5 rounded-2xl neu-pressed border border-[var(--hairline-border)] flex items-center justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-foreground">{action.title}</span>
                  <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0 ${action.tagClass}`}>
                  {action.tag}
                </span>
              </div>
            ))}
          </div>
        </article>
      )}

      {/* Section 6: Monitor & Analytics */}
      {shouldShow("monitor") && (
        <article className="neu-raised neu-grain rounded-3xl p-6 md:p-8 space-y-6">
          <ManualSectionHeading
            stepNumber={6}
            title="การติดตามผลและตรวจสอบค่าใช้จ่าย (Monitor & Analytics)"
            subtitle="วงจรอายุโพสต์และสรุปการใช้เหรียญ Token"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[var(--hairline-border)] neu-pressed space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                สถานะของโพสต์ (Post Lifecycle)
              </div>
              <ul className="text-[11px] space-y-1.5 text-muted-foreground">
                {POST_LIFECYCLE.map((item) => (
                  <li key={item.label}>
                    <span className={`font-bold ${item.tone}`}>{item.label}</span> {item.desc}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl border border-[var(--hairline-border)] neu-pressed space-y-2">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Coins className="size-4 text-teal-500" />
                สรุปค่าใช้จ่าย AI (AI Usage Summary)
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                ในหน้า Post History จะมีแดชบอร์ดสรุปจำนวน Tokens รวมที่ใช้ พร้อมประเมินค่าใช้จ่ายหน่วย USD และคำนวณเป็นเงินบาทไทย (THB) แบบเรียลไทม์ ช่วยให้องค์กรตรวจสอบความคุ้มค่าได้อย่างโปร่งใส
              </p>
            </div>
          </div>
        </article>
      )}

      {/* Section 7: Troubleshooting */}
      {shouldShow("troubleshoot") && (
        <article className="neu-raised neu-grain rounded-3xl p-6 md:p-8 space-y-6">
          <ManualSectionHeading
            stepNumber={7}
            title="การแก้ไขปัญหาเบื้องต้น (Troubleshooting Guide)"
            subtitle="คู่มือแก้ไขปัญหาเมื่อการทำงานขัดข้อง"
          />

          <div className="overflow-x-auto neu-pressed rounded-2xl border border-[var(--hairline-border)] p-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--hairline-border)] text-muted-foreground">
                  <th className="py-2.5 px-3 font-bold">ปัญหาที่พบ</th>
                  <th className="py-2.5 px-3 font-bold">สาเหตุที่เป็นไปได้</th>
                  <th className="py-2.5 px-3 font-bold">แนวทางแก้ไข</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--hairline-border)] text-foreground/85">
                {TROUBLESHOOTING_ROWS.map((row) => (
                  <tr key={row.issue}>
                    <td className="py-3 px-3 font-semibold text-foreground">{row.issue}</td>
                    <td className="py-3 px-3 text-muted-foreground">{row.cause}</td>
                    <td className="py-3 px-3">{row.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {/* Section 8: Google Docs Guide */}
      {shouldShow("googledocs") && (
        <article className="neu-raised neu-mesh-card neu-grain border border-primary/25 rounded-3xl p-6 md:p-8 space-y-6">
          <ManualSectionHeading
            stepNumber={8}
            title="คู่มือการนำเข้าเอกสารสู่ Google Docs (Google Docs Guide)"
            subtitle="2 วิธีในการนำคู่มือนี้ไปเปิดและแก้ไขบน Google Docs ได้สมบูรณ์ 100%"
            accentSolid
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Method 1 */}
            <div className="neu-pressed border border-[var(--hairline-border)] p-5 rounded-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-bold">
                วิธีที่ 1: อัปโหลดไฟล์ .docx (แนะนำ สวยงาม 100%)
              </div>
              <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-2 leading-relaxed">
                <li>คลิกปุ่ม <strong className="text-primary">&quot;ดาวน์โหลดไฟล์ Word (.docx)&quot;</strong> ที่แถบเครื่องมือด้านบน</li>
                <li>เปิดเว็บไซต์ <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-primary underline font-semibold">Google Drive</a></li>
                <li>ลากไฟล์ <code className="neu-raised border border-[var(--hairline-border)] px-1.5 py-0.5 rounded font-mono text-foreground">VibePost_Training_Manual.docx</code> ไปวางในไดรฟ์</li>
                <li>ดับเบิลคลิกไฟล์ และเลือก <strong className="text-foreground">&quot;เปิดด้วย Google เอกสาร (Open with Google Docs)&quot;</strong></li>
                <li>เอกสารจะแปลงเป็น Google Doc สมบูรณ์แบบ พร้อมตาราง หัวข้อ และฟอนต์ที่จัดไว้อย่างเป็นระเบียบ</li>
              </ol>
              <div className="pt-2">
                <a
                  href="/downloads/VibePost_Training_Manual.docx"
                  download="VibePost_Training_Manual.docx"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-md shadow-primary/25"
                >
                  <Download className="size-3.5" />
                  ดาวน์โหลดไฟล์ .docx ทันที
                </a>
              </div>
            </div>

            {/* Method 2 */}
            <div className="neu-pressed border border-[var(--hairline-border)] p-5 rounded-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-raised border border-[var(--hairline-border)] text-foreground text-xs font-bold">
                วิธีที่ 2: ใช้ปุ่มคัดลอกด่วน (1-Click Copy)
              </div>
              <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-2 leading-relaxed">
                <li>คลิกปุ่ม <strong className="text-foreground">&quot;📋 คัดลอกเนื้อหา&quot;</strong> ที่แถบด้านบนของหน้านี้</li>
                <li>เปิดแท็บใหม่ไปที่ <a href="https://docs.new" target="_blank" rel="noreferrer" className="text-teal-500 underline font-semibold">docs.new</a> เพื่อสร้างเอกสารเปล่าทันที</li>
                <li>กดแป้นพิมพ์ <strong className="text-foreground">Ctrl + V</strong> (หรือ Cmd + V บน Mac) เพื่อวางเนื้อหา</li>
                <li>เนื้อหาทั้งหมดจะถูกนำไปจัดวางใน Google Doc พร้อมแก้ไขและแชร์กับทีมงานได้ทันที</li>
              </ol>
              <div className="pt-2">
                <a
                  href="https://docs.new"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl neu-raised border border-[var(--hairline-border)] text-foreground hover:text-primary text-xs font-bold transition-all"
                >
                  <ExternalLink className="size-3.5 text-teal-500" />
                  เปิด docs.new ในแท็บใหม่
                </a>
              </div>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
