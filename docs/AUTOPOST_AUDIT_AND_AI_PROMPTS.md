# VibePost — ผลวิเคราะห์ระบบ Autopost และชุด Prompt สำหรับสั่ง AI ปรับปรุง

> วิเคราะห์จากซอร์สโค้ดใน `C:\atgv\content_project` (Next.js 16 + Prisma 7 + PostgreSQL + NextAuth v5, deploy ด้วย Docker/Coolify บน Hostinger VPS)
> วันที่วิเคราะห์: 5 ต.ค. 2026
> วิธีใช้: เปิด Claude Code (หรือ AI coding agent อื่น) ที่โฟลเดอร์โปรเจกต์ แล้วสั่งทีละ Prompt ตามลำดับ Phase — **ห้ามข้าม Phase 0**

---

## ส่วนที่ 1 — สรุปผลวิเคราะห์

### 1.1 ภาพรวมปัจจุบัน
| ส่วน | สถานะปัจจุบัน |
|---|---|
| การเชื่อม Social | ผู้ใช้ **วาง Access Token เองด้วยมือ** (`ConnectSocialModal.tsx`) ไม่มี OAuth, ไม่มี refresh token, ไม่ตรวจวันหมดอายุ |
| Platform ที่โพสต์ได้จริง | Facebook (ข้อความ/รูป/อัลบั้ม/วิดีโอ), Instagram (รูปเดี่ยว/Reels), TikTok (init เท่านั้น), YouTube |
| Platform ที่มีใน enum แต่ยังไม่ทำ | Twitter/X, LinkedIn, LINE → จะ FAILED ทุกครั้ง |
| Publisher | ฟังก์ชันเดียว 459 บรรทัด (`src/lib/services/publisher.ts`) เป็น if/else ต่อ platform, วนทำทีละโพสต์ในรอบ cron เดียว |
| Scheduler | crontab บน host ยิง `curl` ไป IP ของ container ทุก 5 นาที (`setup_cron.py`) |
| Media | เก็บไฟล์ที่ `/app/uploads` ใน container, เสิร์ฟผ่าน `/api/files/*` |
| Graph API | ฝังเลข `v19.0` ตายตัวทุกจุด (เวอร์ชันเก่า, Meta ทยอยปิดเวอร์ชันเก่า) |

### 1.2 ปัญหาด้านความปลอดภัย (🔴 ต้องแก้ก่อนทุกอย่าง)
1. สคริปต์ใน `scripts/ops/` อ่านรหัสผ่านจาก env แล้ว และ `*.py` อยู่ใน .gitignore (ไม่เคยถูก commit) — ✅ แก้ 3 ไฟล์ที่ใส่ `PGPASSWORD` ผิดรูปแบบแล้ว
1b. **หน้า /dashboard ส่ง workspace ทั้งก้อน (รวม accessToken และ apiKey) เข้า client component `MobileDashboardOverview`** → secret ไปอยู่ใน HTML ของผู้ใช้ทุกคนที่ล็อกอิน — ✅ แก้แล้ว (Phase 0)
2. **`env_deploy.txt` (มี `DATABASE_URL` + `AUTH_SECRET`) และ `app.zip` ถูก track อยู่ใน git** (ยืนยันด้วย `git ls-files`) — อยู่ใน history ที่ push ไป `github.com/isarachootip/vibepost`
3. **`/api/*` ทั้งหมดไม่ผ่าน auth middleware** (`src/proxy.ts` matcher ยกเว้น `api`) ทำให้ใครก็เรียกได้:
   - `/api/automation` — **รันคำสั่ง shell (`exec`) และแก้ crontab** ได้โดยไม่ต้องล็อกอิน
   - `/api/upload` — อัปโหลดไฟล์ได้ไม่จำกัดผู้ใช้
   - `/api/seed-odm` — **ลบข้อมูลโพสต์/การเชื่อมต่อของ workspace "ODM"** ด้วย GET
   - `/api/test-db`, `/api/test-gemini` — endpoint ทดสอบที่ยังเปิดใน production
   - `/api/public/published-posts` — เปิดเนื้อหาที่โพสต์แล้ว **ของทุก workspace** สู่สาธารณะ
4. `/api/cron/publisher` **ทำงานแบบไม่มีการป้องกันถ้าไม่ตั้ง `CRON_SECRET`** และสคริปต์ cron ก็ไม่ได้ส่ง header Authorization
5. Access token ของ Social และ API key ของ AI **เก็บเป็น plain text** ใน DB; `getActiveWorkspaceContext()` include `socialConnections` + `promptConfigs` มาทั้งก้อน เสี่ยงหลุดไป client component
6. บัญชี Admin ใช้รหัสผ่านอ่อน (`password123`) และ login ไม่มี rate limit / 2FA
7. Token ถูกใส่ใน query string (`?access_token=`) ซึ่งมักไปโผล่ใน log

### 1.3 ปัญหาด้านความน่าเชื่อถือของ Autopost (🟠)
1. **Race condition**: `findMany` แล้วค่อย `update` เป็น PUBLISHING ทีละตัว — ถ้า cron 2 รอบซ้อนกัน โพสต์ซ้ำได้ (ต้อง atomic claim)
2. **ไม่มี retry**: พลาดครั้งเดียว = FAILED ถาวร ไม่แยก error ชั่วคราว (rate limit/5xx) กับ error ถาวร (token หมดอายุ/สื่อผิดสเปก)
3. **โพสต์ค้าง PUBLISHING ตลอดไป** ถ้า process ตายกลางทาง ไม่มีตัวกู้คืน
4. **สถานะรวมผิด**: ถ้า 3 ช่องสำเร็จ 1 ช่องพลาด ทั้งโพสต์เป็น FAILED (ไม่มี PARTIAL)
5. **ไม่มี idempotency**: retry อาจโพสต์ซ้ำบนแพลตฟอร์ม
6. Cron รันในคำขอ HTTP เดียว: IG Reels poll 75 วินาที + YouTube โหลดวิดีโอทั้งไฟล์เข้า RAM → timeout/หน่วยความจำเต็มเมื่อมีหลายโพสต์
7. **TikTok บันทึก `publish_id` เป็น PUBLISHED ทันที** ทั้งที่ยังไม่รู้ผลจริง (ต้อง poll status) และตั้ง `PUBLIC_TO_EVERYONE` ตายตัว (แอปที่ยังไม่ผ่าน audit ของ TikTok โพสต์ได้แค่แบบส่วนตัว และต้องอ่าน creator_info ก่อน)
8. Instagram ไม่รองรับ Carousel, Stories; Facebook ไม่รองรับ Reels; ทุกช่องใช้แคปชันเดียวกัน (ไม่สนข้อจำกัดความยาว/hashtag ของแต่ละแพลตฟอร์ม)
9. "โพสต์ทันที" จริง ๆ ต้องรอ cron สูงสุด 5 นาที
10. ไฟล์สื่ออยู่ใน container → หายเมื่อ redeploy ถ้าไม่ได้ mount volume, ไม่มี CDN, ไม่ตรวจสเปกสื่อต่อแพลตฟอร์ม
11. ไม่มีระบบแจ้งเตือนเมื่อโพสต์ล้มเหลว/token ใกล้หมดอายุ; สถานะ `WAITING_APPROVAL`/`APPROVED` มีใน schema แต่ยังไม่มี workflow ใช้งาน
12. Insights ใช้ metric บางตัวที่ Meta เลิกใช้แล้ว (เช่น `post_engaged_users`)

### 1.4 ปัญหาด้านการขยายระบบ (🟡)
- เพิ่ม platform ใหม่ต้องแก้ไฟล์ publisher ก้อนเดียว + enum + UI หลายจุด (ไม่มี Provider/Adapter pattern)
- ไม่มีตาราง log ความพยายามโพสต์แต่ละครั้ง, ไม่มี audit log
- ไม่มี test, ไม่มี CI, ไม่มี env validation, root โปรเจกต์มีสคริปต์ชั่วคราวเกลื่อน
- `scheduledTime` ไม่มีการจัดการ timezone ชัดเจน (ควรเก็บ UTC + timezone ของ workspace)

### 1.5 สถาปัตยกรรมเป้าหมาย
```
UI (Next.js) ──> Server Actions ──> Post + PostTarget (DB)
                                        │ enqueue (ต่อ target)
                                        ▼
                         Job Queue (pg-boss บน Postgres เดิม)
                                        │
                         Worker process แยก (Docker service ที่ 2)
                                        │
                    ProviderRegistry ──> FacebookProvider / InstagramProvider /
                                         TikTokProvider / YouTubeProvider /
                                         LinkedInProvider / XProvider /
                                         ThreadsProvider / LineOAProvider / ...
                                        │
                         PublishAttempt log + Notification + Insights sync
Media: Object Storage (S3/Cloudflare R2) + ตรวจสเปก/แปลงไฟล์ด้วย ffmpeg/sharp
Token: OAuth + เข้ารหัส AES-256-GCM + refresh job อัตโนมัติ
```

---

## ส่วนที่ 2 — สิ่งที่ "คุณ" ต้องทำเองทันที (AI ทำแทนไม่ได้)
1. **เปลี่ยนรหัสผ่าน root ของ VPS** แล้วเปลี่ยนเป็น SSH key + ปิด password login (`PasswordAuthentication no`)
2. **เปลี่ยนรหัสผ่าน PostgreSQL, `AUTH_SECRET`, ตั้ง `CRON_SECRET` ใหม่** (ค่าเดิมหลุดอยู่ใน git history แล้ว)
3. **เปลี่ยนรหัสผ่าน admin@content.com** เป็นรหัสยาวแบบสุ่ม
4. ตรวจว่า repo GitHub เป็น **Private**; ถ้าเคยเป็น Public ให้ถือว่าทุก secret หลุดแล้ว
5. Revoke แล้วออก Access Token ของ Facebook/IG/TikTok/YouTube และ API key AI ใหม่ทั้งหมด
6. สำรองฐานข้อมูลก่อนเริ่มให้ AI แก้ schema

---

## ส่วนที่ 3 — ชุด Prompt สำหรับสั่ง AI (ใช้ตามลำดับ)

> **Prompt ตั้งต้น (ส่งก่อนทุกครั้งที่เปิด session ใหม่)**
```
คุณคือ Senior Full-stack Engineer ที่เชี่ยวชาญ Next.js App Router, Prisma, PostgreSQL และ Social Media Publishing APIs
โปรเจกต์นี้คือ VibePost ระบบสร้างคอนเทนต์ด้วย AI และ Autopost ไปหลายช่องทาง
ก่อนเริ่ม ให้อ่าน docs/AUTOPOST_AUDIT_AND_AI_PROMPTS.md, prisma/schema.prisma, src/lib/services/publisher.ts, src/lib/actions/*.ts และ src/proxy.ts
กติกา:
- ทำทีละ Prompt ให้เสร็จ ทดสอบ (npm run build, lint, typecheck, test) ผ่านก่อนรายงาน
- ห้ามใส่ secret ลงในโค้ดหรือไฟล์ที่ commit; ใช้ environment variable เท่านั้น
- การเปลี่ยน schema ต้องทำผ่าน prisma migrate และต้องไม่ทำข้อมูลเดิมหาย
- ก่อนเรียก API ของแพลตฟอร์มใด ให้ตรวจสอบเอกสารทางการล่าสุดของแพลตฟอร์มนั้น (endpoint, version, scope, ข้อจำกัดสื่อ) อย่าเดาจากความจำ
- commit แยกตามหัวข้อ พร้อมข้อความ commit ที่อธิบายชัดเจน
- จบงานแต่ละ Prompt ให้สรุป: ไฟล์ที่แก้, migration ที่เพิ่ม, env ที่ต้องตั้งเพิ่ม, วิธีทดสอบ, ความเสี่ยงที่เหลือ
```

### Phase 0 — ปิดช่องโหว่ความปลอดภัย (ทำก่อน)

> **สถานะ 5 ต.ค. 2026: ✅ ลงมือทำแล้ว (ยังไม่ commit)** — build ผ่าน, ทดสอบ route ไม่ล็อกอินได้ 401/404
> ก่อน deploy ต้องทำตาม `docs/SECRET_ROTATION.md` (ตั้ง CRON_SECRET + ENCRYPTION_KEY + อัปเดต cron บน VPS)
> สิ่งที่ยังค้างจาก Prompt 0.2: `/api/automation` ยังรัน shell อยู่ (จำกัดเฉพาะ Super Admin แล้ว — ย้ายไป DB ใน Phase 2), `/api/files` ยังเปิดสาธารณะโดยตั้งใจ (แพลตฟอร์มต้องดึงไฟล์ได้ — ชื่อไฟล์ใหม่สุ่มเดาไม่ได้แล้ว), Gemini API key ยังอยู่ใน query string (`?key=`)

**Prompt 0.1 — ล้าง secret และสคริปต์ชั่วคราว**
```
ภารกิจ: ทำให้ repo ไม่มี secret และไฟล์ชั่วคราว
1. แก้สคริปต์ทุกไฟล์ใน scripts/ops/ (check_*.py, fix*.py, ssh_*.py, deploy_direct.py, setup_*.py, remote_exec.py, tunnel.js, db-exec.js ฯลฯ) ให้อ่าน host/user/password/token จาก environment variable (os.environ) แทนค่าที่ฝังไว้ ถ้าไม่มีค่าให้ error ทันที; ลบ __pycache__ และเพิ่ม __pycache__/, *.zip, env_*.txt ลง .gitignore; ย้าย test_fb_post.js, translate-ui.js, update-theme.js ที่ root ไป scripts/
2. เอา env_deploy.txt และ app.zip ออกจาก git index (git rm --cached) และเพิ่ม .env.example ที่มีแต่ชื่อตัวแปรพร้อมคำอธิบาย
3. ค้นทั้ง repo (ยกเว้น node_modules/.next) หา pattern ของ password, token, API key, connection string แล้วรายงานรายการไฟล์ (ห้ามพิมพ์ค่า secret ออกมา)
4. เขียนคู่มือใน docs/SECRET_ROTATION.md ว่าต้อง rotate อะไรบ้าง และคำสั่ง git filter-repo สำหรับลบ env_deploy.txt และ app.zip ออกจาก history (ให้ผมเป็นคนรันเอง ห้ามรันเอง)
ผลลัพธ์ที่ยอมรับได้: git grep ไม่พบ secret, build ผ่าน
```

**Prompt 0.2 — ป้องกัน API routes**
```
ภารกิจ: ทุก /api route ต้องมีการยืนยันตัวตนและสิทธิ์
1. สร้าง src/lib/auth-guard.ts มี requireUser(), requireWorkspaceRole(workspaceId, minRole), requireSuperAdmin() ใช้ร่วมกันทั้ง server actions และ route handlers
2. /api/upload: ต้องล็อกอิน + ไม่ใช่ VIEWER, ผูกไฟล์กับ workspace, ตรวจชนิดไฟล์จาก magic bytes (ไม่เชื่อ file.type), จำกัดขนาดจาก env
3. /api/automation: ลบการใช้ child_process/exec/ssh ทั้งหมด เปลี่ยนเป็นอ่าน/เขียนค่าตั้งค่า scheduler ใน DB (ตาราง SystemSetting) และให้เฉพาะ Super Admin
4. ลบ /api/test-db, /api/test-gemini, /api/seed-odm ออก (ย้าย seed ไป prisma/seed.ts ที่รันผ่าน CLI เท่านั้น)
5. /api/cron/publisher: ถ้าไม่มี CRON_SECRET ให้ตอบ 503 (fail closed) และเทียบ secret ด้วย timingSafeEqual
6. /api/public/published-posts: ให้แสดงเฉพาะ workspace ที่เปิด flag isPublicShowcase = true (เพิ่ม field ใน Workspace ค่าเริ่มต้น false) และไม่ส่งชื่อ workspace/บัญชีถ้าไม่จำเป็น
7. /api/files/[filename]: ตรวจสิทธิ์สำหรับไฟล์ที่ยังไม่ publish หรือเปลี่ยนเป็น signed URL มีอายุ
8. เพิ่ม rate limit ให้ login (เช่น 5 ครั้ง/15 นาที ต่อ IP+email) และเพิ่ม security headers ใน next.config.ts
ผลลัพธ์: เขียน test ยืนยันว่าเรียกทุก route โดยไม่ล็อกอินได้ 401/403
```

**Prompt 0.3 — เข้ารหัส token และ API key**
```
ภารกิจ: เข้ารหัสข้อมูลลับใน DB
1. สร้าง src/lib/crypto.ts ใช้ AES-256-GCM, key จาก env ENCRYPTION_KEY (32 bytes base64) รองรับ key rotation ด้วย keyId นำหน้า ciphertext
2. เข้ารหัส SocialConnection.accessToken, refreshToken และ PromptConfig.apiKey เวลาเขียน และถอดรหัสเฉพาะใน server ตอนใช้งาน
3. เขียน migration script (scripts/encrypt-existing-secrets.ts) เข้ารหัสข้อมูลเดิม แบบ idempotent
4. แก้ getActiveWorkspaceContext() ไม่ให้ include ค่า token/apiKey; สร้าง DTO สำหรับส่งให้ client ที่มีแค่ id, platform, accountName, status, tokenExpiresAt และ apiKey แบบ mask (เช่น ****abcd)
5. ห้ามใส่ access_token ใน query string ถ้า API รองรับ header/body และห้าม log token
```

### Phase 1 — สถาปัตยกรรม Provider ที่ขยายได้

**Prompt 1.1 — ออกแบบ Provider Interface + Registry**
```
ภารกิจ: Refactor src/lib/services/publisher.ts ให้เป็น Adapter pattern โดยพฤติกรรมเดิมต้องไม่เปลี่ยน
1. สร้าง src/lib/social/types.ts:
   interface SocialProvider {
     platform: Platform;
     capabilities: { text: boolean; image: { max: number }; video: boolean; carousel: boolean; reels: boolean; stories: boolean; firstComment: boolean; maxCaptionLength: number; maxHashtags?: number; requiresMedia: boolean };
     validate(post: PublishPayload): ValidationIssue[];        // ตรวจก่อนเข้าคิว
     publish(ctx: PublishContext): Promise<PublishResult>;      // คืน externalId หรือ pendingRemoteId
     checkStatus?(ctx, remoteId): Promise<RemoteStatus>;        // สำหรับแพลตฟอร์มแบบ async (IG, TikTok, YouTube)
     refreshToken?(conn): Promise<TokenSet>;
     fetchInsights?(conn, externalId): Promise<NormalizedInsights>;
     getAuthUrl?(state): string; handleCallback?(code): Promise<ConnectedAccount[]>;
   }
2. สร้าง error class มาตรฐาน: TransientError (retry ได้), RateLimitError (มี retryAfter), AuthError (ต้องเชื่อมต่อใหม่), ValidationError (ไม่ retry) และ map error code ของแต่ละแพลตฟอร์มเข้ากลุ่มเหล่านี้
3. แยก providers/facebook.ts, instagram.ts, tiktok.ts, youtube.ts จากโค้ดเดิม และ registry.ts
4. ย้าย base URL/version ของ Graph API ไปเป็น env (META_GRAPH_VERSION) และอัปเดตเป็นเวอร์ชันที่ Meta ยังรองรับในปัจจุบัน (ตรวจจากเอกสาร Meta)
5. เขียน unit test ต่อ provider โดย mock fetch ครอบคลุม text/image/multi-image/video/error
6. เพิ่มเอกสาร docs/ADDING_A_PLATFORM.md อธิบายขั้นตอนเพิ่มแพลตฟอร์มใหม่ (ควรแก้แค่ไฟล์ provider + registry + config UI)
```

**Prompt 1.2 — ปรับ Database Schema**
```
ภารกิจ: ปรับ prisma/schema.prisma รองรับ autopost ระดับ production (ทำ migration ที่ไม่ทำข้อมูลหาย)
- PostStatus: เพิ่ม QUEUED, PARTIALLY_PUBLISHED, CANCELLED
- Post: timezone (default "Asia/Bangkok"), approvedById, approvedAt, createdById
- PostTarget: เพิ่ม captionOverride, options Json (เช่น privacy, firstComment, postType: FEED|REEL|STORY|CAROUSEL, title, tags), attemptCount, nextAttemptAt, lastErrorCode, lastErrorType, remoteStatusId, publishedAt, idempotencyKey (unique), permalink
- ตารางใหม่ PublishAttempt (targetId, startedAt, finishedAt, outcome, httpStatus, errorCode, errorMessage, requestId, durationMs)
- SocialConnection: status enum (ACTIVE, EXPIRING, EXPIRED, REVOKED, ERROR), scopes String[], parentConnectionId (เช่น IG ที่ผูกกับ FB Page), lastCheckedAt, metadata Json, unique(workspaceId, platform, accountId)
- MediaAsset: storageKey, mimeType, sizeBytes, width, height, durationSec, checksum, thumbnailUrl, createdById
- AuditLog (actorId, workspaceId, action, entity, entityId, meta Json, createdAt)
- Notification (workspaceId, userId?, type, payload, readAt)
- เพิ่ม index: Post(status, scheduledTime), PostTarget(status, nextAttemptAt), และ onDelete ที่เหมาะสม
- Platform enum: เพิ่ม THREADS, PINTEREST (และคง TWITTER, LINKEDIN, LINE)
อัปเดตโค้ดที่อ้างถึง field เดิมทั้งหมดให้ build ผ่าน
```

### Phase 2 — Queue, Worker, Retry

**Prompt 2.1 — Job Queue + Worker**
```
ภารกิจ: เปลี่ยนจาก cron ยิง HTTP วนลูป เป็น job queue
1. ใช้ pg-boss (ใช้ PostgreSQL เดิม ไม่ต้องเพิ่ม Redis) — ถ้ามีเหตุผลจะใช้ BullMQ+Redis ให้เสนอข้อดีข้อเสียก่อน
2. เมื่อโพสต์ถูก schedule/approve ให้สร้าง job ต่อ PostTarget (job key = PostTarget.id เพื่อกันซ้ำ) ตั้ง startAfter = scheduledTime; "โพสต์ทันที" ต้องเข้าคิวทันทีไม่รอรอบ cron
3. สร้าง src/worker/index.ts เป็น process แยก (npm run worker) + เพิ่ม service ใน Dockerfile/docker-compose; จำกัด concurrency ต่อแพลตฟอร์มและต่อ connection
4. Claim งานแบบ atomic (ถ้าไม่ใช้ pg-boss ให้ใช้ UPDATE ... WHERE status='SCHEDULED' ... RETURNING หรือ SELECT FOR UPDATE SKIP LOCKED)
5. Retry: TransientError/RateLimitError → exponential backoff + jitter สูงสุด 5 ครั้ง (ค่าจาก env); AuthError → FAILED + ตั้ง SocialConnection.status=EXPIRED + แจ้งเตือน; ValidationError → FAILED ทันที
6. Idempotency: ก่อน publish ถ้า PostTarget มี externalPostId แล้วให้ข้าม; บันทึก PublishAttempt ทุกครั้ง
7. งาน async (IG container, TikTok publish_id, YouTube processing) ให้สร้าง job "check-status" แยก poll ด้วย backoff แทนการ sleep ใน loop
8. Reaper job ทุก 5 นาที: target ที่ค้าง PUBLISHING เกิน X นาที → กลับไป retry หรือ FAILED
9. สรุปสถานะ Post จาก targets: ทั้งหมดสำเร็จ=PUBLISHED, บางส่วน=PARTIALLY_PUBLISHED, ไม่สำเร็จเลย=FAILED
10. คง /api/cron/publisher ไว้เป็น fallback ที่แค่ enqueue งานที่ถึงเวลา (สำหรับกรณี worker ล่ม) และเลิกใช้ crontab บน host
11. เพิ่ม /api/health ตรวจ DB + queue + อายุ job ล่าสุด
เขียน integration test สำหรับ: claim ซ้ำไม่โพสต์ซ้ำ, retry ตามประเภท error, partial success
```

### Phase 3 — การเชื่อมต่อแพลตฟอร์มแบบมาตรฐาน (OAuth)

**Prompt 3.1 — OAuth Framework + Meta (Facebook/Instagram/Threads)**
```
ภารกิจ: เลิกให้ผู้ใช้วาง Access Token เอง เปลี่ยนเป็น OAuth
1. สร้าง route /api/oauth/[platform]/start และ /api/oauth/[platform]/callback ใช้ state (ผูก userId+workspaceId, เก็บใน cookie แบบ signed) + PKCE เมื่อแพลตฟอร์มรองรับ
2. Facebook: ขอ scope ที่จำเป็นสำหรับการจัดการและโพสต์เพจ, แลก long-lived user token แล้วดึง Page token ของทุกเพจ ให้ผู้ใช้เลือกเพจที่จะเชื่อม
3. Instagram: รองรับทั้งแบบผูกผ่าน Facebook Page และ Instagram API with Instagram Login (เลือกตามเอกสาร Meta ปัจจุบัน); รองรับ Feed รูปเดี่ยว, Carousel (สูงสุดตามสเปก), Reels, Stories; ตรวจ content publishing limit ต่อ 24 ชม. ก่อนโพสต์
4. Facebook: เพิ่ม Reels และการตั้ง first comment
5. Threads: เพิ่ม ThreadsProvider ตาม Threads API (ข้อความ/รูป/วิดีโอ/carousel)
6. Job ตรวจสุขภาพ token รายวัน: debug token, อัปเดต status/tokenExpiresAt, แจ้งเตือนก่อนหมดอายุ 7 วัน
7. หน้า /dashboard/social แสดงสถานะการเชื่อมต่อ ปุ่ม Reconnect และ scope ที่ขาด
8. คงโหมดวาง token เองไว้เฉพาะ Super Admin สำหรับ debug (ซ่อนจากผู้ใช้ทั่วไป)
ตรวจสอบ endpoint, scope และข้อจำกัดจากเอกสาร Meta for Developers ล่าสุดก่อนเขียน และสรุปขั้นตอน App Review ที่ผมต้องยื่นเอง
```

**Prompt 3.2 — TikTok, YouTube**
```
ภารกิจ: ทำ TikTok และ YouTube ให้ถูกต้องตามมาตรฐานปัจจุบัน
TikTok (Content Posting API):
- OAuth v2 + refresh token อัตโนมัติ
- ก่อนโพสต์ต้องเรียก creator_info เพื่อดึง privacy options, ความยาววิดีโอสูงสุด, การปิด comment/duet/stitch แล้วให้ UI ให้ผู้ใช้เลือก (ห้ามตั้ง PUBLIC_TO_EVERYONE ตายตัว)
- รองรับ Direct Post และ Upload to inbox (draft); ถ้าแอปยังไม่ผ่าน audit ให้บังคับ privacy เป็นแบบส่วนตัวและแจ้งผู้ใช้
- หลัง init ให้ poll publish status จนได้ผลจริงก่อนตั้ง PUBLISHED และเก็บ post id จริง
- รองรับ photo post (carousel) ตามสเปก
YouTube (Data API v3):
- OAuth + refresh token, เลือก channel
- อัปโหลดแบบ resumable แบบ stream/chunk ไม่โหลดทั้งไฟล์เข้า RAM, รองรับ resume เมื่อหลุด
- options: title (ไม่ใช่ตัดจากแคปชันอัตโนมัติ), description, tags, privacyStatus, publishAt, madeForKids, categoryId, thumbnail, Shorts (วิดีโอแนวตั้ง)
- คำนึงถึง quota รายวันของ API: นับ quota ที่ใช้และกันไม่ให้เกิน
เขียน test ด้วย mock และสรุปขั้นตอน audit/verification ที่ผมต้องยื่นเอง
```

**Prompt 3.3 — LinkedIn, X, LINE OA, Pinterest**
```
ภารกิจ: เพิ่ม provider ใหม่ตาม docs/ADDING_A_PLATFORM.md
- LinkedIn: OAuth, โพสต์ในนามบุคคลและ Organization Page ผ่าน Posts API เวอร์ชันปัจจุบัน (ใส่ version header ตามเอกสาร), รองรับข้อความ/รูป/หลายรูป/วิดีโอ/ลิงก์
- X (Twitter): OAuth 2.0 PKCE, API v2 โพสต์ข้อความ + media upload, ตัดแคปชันตามจำนวนตัวอักษรที่อนุญาต หรือแตกเป็น thread ได้; แสดงคำเตือนเรื่องแพ็กเกจ API แบบเสียเงินและ rate limit
- LINE Official Account: Messaging API (broadcast / narrowcast / push) ส่งข้อความ+รูป/Flex Message, แสดงจำนวน quota ข้อความคงเหลือของเดือน
- Pinterest: OAuth, เลือก board, สร้าง Pin รูป/วิดีโอ พร้อม link
ทุกตัวต้องมี capabilities, validate, map error, test และเปิด/ปิดได้ผ่าน feature flag ต่อ workspace
```

### Phase 4 — Media Pipeline

**Prompt 4.1 — Object Storage + ตรวจสเปกสื่อ**
```
ภารกิจ: ย้ายไฟล์สื่อออกจาก container
1. สร้าง src/lib/storage/ มี interface StorageDriver (put, getSignedUrl, getPublicUrl, delete) และ driver: S3-compatible (รองรับ Cloudflare R2 / AWS S3 / MinIO) และ local (สำหรับ dev)
2. อัปโหลดแบบ presigned URL จาก browser ตรงไป storage (ไม่ผ่าน Next.js) จำกัดขนาด/ชนิด
3. หลังอัปโหลด: อ่าน metadata (ขนาด, กว้าง/สูง, ความยาววิดีโอ, codec) ด้วย sharp/ffprobe, สร้าง thumbnail, คำนวณ checksum บันทึกลง MediaAsset
4. Media spec validator ต่อ provider (อัตราส่วนภาพ, ความละเอียด, ความยาววิดีโอ, ขนาดไฟล์, codec) แสดงคำเตือนใน UI ก่อนกด schedule
5. ตัวเลือก auto-transform: ครอบ/resize รูป, แปลงวิดีโอเป็น H.264/AAC แนวตั้ง 9:16 สำหรับ Reels/TikTok/Shorts (ทำใน worker)
6. ย้ายสื่อเดิมจาก /app/uploads ขึ้น storage ด้วย script แบบ idempotent และอัปเดต fileUrl
7. รูปจาก AI ที่เป็น base64 ต้องอัปโหลดขึ้น storage ก่อนบันทึก ห้ามเก็บ base64 ลง DB
```

### Phase 5 — Content Workflow ต่อช่องทาง

**Prompt 5.1 — Per-channel caption, Approval, Calendar**
```
ภารกิจ: ยกระดับ workflow การสร้างและอนุมัติโพสต์
1. ใน Publisher Wizard ให้แก้แคปชันแยกต่อช่องทางได้ (captionOverride) แสดงตัวนับตัวอักษร/hashtag ตาม capabilities ของแต่ละแพลตฟอร์ม และปุ่ม "ให้ AI ปรับแคปชันให้เหมาะกับแต่ละช่อง"
2. Preview จำลองหน้าตาแต่ละแพลตฟอร์ม
3. Approval workflow: ถ้า workspace เปิด requireApproval โพสต์จาก MEMBER ไป WAITING_APPROVAL; ADMIN อนุมัติ/ตีกลับพร้อมความเห็น; อนุมัติแล้วค่อยเข้าคิว
4. หน้า Content Calendar (รายวัน/สัปดาห์/เดือน) ลากเปลี่ยนเวลาได้, แสดงตาม timezone ของ workspace, เก็บใน DB เป็น UTC
5. Queue slots: ตั้งช่วงเวลาโพสต์ประจำต่อช่องทาง และปุ่ม "เพิ่มเข้าคิวถัดไป"
6. ยกเลิก/แก้ไขโพสต์ที่ schedule แล้ว (ลบ job ในคิวและสร้างใหม่), ปุ่ม Retry สำหรับ target ที่ FAILED
7. บันทึก AuditLog ทุกการสร้าง/แก้/อนุมัติ/ลบ/เชื่อมต่อ
```

### Phase 6 — Monitoring, Notification, Insights

**Prompt 6.1**
```
ภารกิจ: ทำให้ผู้ดูแลรู้ปัญหาก่อนลูกค้าบอก
1. Structured logging (pino) ใส่ requestId/jobId/postId/targetId ทุกบรรทัด ห้าม log token
2. ต่อ Sentry (หรือเทียบเท่า) ทั้ง web และ worker
3. Notification: in-app + Email + LINE (ใช้ LINE Messaging API เพราะ LINE Notify ปิดบริการแล้ว) เมื่อ: target FAILED, token ใกล้หมด/หมดอายุ, คิวค้าง, quota ใกล้เต็ม
4. หน้า /dashboard/monitor: ตารางคิวงาน (รอ/กำลังทำ/retry/ล้มเหลว), รายละเอียด PublishAttempt แต่ละครั้ง, ปุ่ม retry/cancel, กราฟอัตราสำเร็จต่อแพลตฟอร์ม
5. Insights sync job: ดึงสถิติหลังโพสต์ 1 ชม., 24 ชม., 7 วัน ผ่าน provider.fetchInsights ใช้ metric ที่แพลตฟอร์มยังรองรับ (ตรวจเอกสาร) แปลงเป็น NormalizedInsights เดียวกัน
6. Webhook รับ event จากแพลตฟอร์มที่รองรับ (เช่น Meta) ตรวจลายเซ็นทุกครั้ง
```

### Phase 7 — คุณภาพโค้ดและการ Deploy

**Prompt 7.1**
```
ภารกิจ: ทำให้ระบบดูแลรักษาได้ระยะยาว
1. Env validation ด้วย zod ใน src/lib/env.ts ให้แอปไม่ start ถ้าตัวแปรสำคัญขาด
2. ตั้ง Vitest (unit) + Playwright (e2e flow: login → สร้างโพสต์ → schedule → worker publish ด้วย mock provider)
3. GitHub Actions: lint, typecheck, test, build, prisma migrate diff ทุก PR
4. Dockerfile: แยก target web/worker, รัน prisma migrate deploy ตอน release, healthcheck; docker-compose สำหรับ dev (postgres + minio)
5. ลบ any ที่ไม่จำเป็นใน publisher/actions, จัดการ error เป็น Result type
6. เพิ่ม 2FA (TOTP) สำหรับ ADMIN และนโยบายรหัสผ่านขั้นต่ำ, หน้าจัดการผู้ใช้/เชิญสมาชิกด้วยอีเมล
7. Backup DB อัตโนมัติรายวัน + เอกสาร restore
8. อัปเดต SYSTEM_MANUAL.md และ Feature.md ให้ตรงกับระบบใหม่
```

---

## ส่วนที่ 4 — ลำดับความสำคัญแนะนำ
| ลำดับ | งาน | เหตุผล |
|---|---|---|
| 1 | ส่วนที่ 2 (คุณทำเอง) + Prompt 0.1–0.3 | ระบบมีช่องโหว่ที่ให้คนนอกรันคำสั่งบนเซิร์ฟเวอร์ได้ |
| 2 | Prompt 1.1, 1.2 | วางโครงให้ทุกอย่างหลังจากนี้ต่อยอดได้ |
| 3 | Prompt 2.1 | แก้โพสต์ซ้ำ/ค้าง/ไม่ retry — หัวใจของ Autopost |
| 4 | Prompt 3.1, 3.2, 4.1 | ช่องทางหลักของตลาดไทย (FB/IG/TikTok/YouTube) ให้เสถียร |
| 5 | Prompt 5.1, 6.1 | ประสบการณ์ผู้ใช้และการดูแลระบบ |
| 6 | Prompt 3.3, 7.1 | ขยายช่องทางและความยั่งยืน |

> หมายเหตุ: รายละเอียด API ของแต่ละแพลตฟอร์ม (เวอร์ชัน, scope, ข้อจำกัด, เงื่อนไข App Review/Audit) เปลี่ยนบ่อย — ทุก Prompt จึงสั่งให้ AI ตรวจเอกสารทางการล่าสุดก่อนเขียนโค้ด
