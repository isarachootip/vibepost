# Phase 0 — คู่มือ Deploy และเปลี่ยน Secret (ต้องทำตามลำดับ)

> โค้ด Phase 0 เปลี่ยนพฤติกรรม 2 อย่างที่ **ต้องตั้งค่าก่อน deploy** ไม่อย่างนั้น Autopost จะหยุดทำงาน:
> 1. `/api/cron/publisher` จะ **ปฏิเสธทุกคำขอ** ถ้าไม่มี `CRON_SECRET` (ตอบ 503) หรือ header ไม่ตรง (401)
> 2. Token/API key จะถูกเข้ารหัสเมื่อมี `ENCRYPTION_KEY` — ถ้าทำ key หาย ข้อมูลที่เข้ารหัสแล้วจะอ่านไม่ได้

## ขั้นที่ 1 — สร้างค่าใหม่ (ทำบนเครื่องคุณ)
```powershell
# CRON_SECRET (64 ตัวอักษร)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# ENCRYPTION_KEY (32 bytes base64)  — เก็บสำรองไว้ใน Password Manager ด้วย
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# AUTH_SECRET ใหม่
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## ขั้นที่ 2 — ตั้ง Environment Variables ใน Coolify (แอป vibepost)
| ตัวแปร | ค่า | หมายเหตุ |
|---|---|---|
| `CRON_SECRET` | จากขั้นที่ 1 | อย่างน้อย 16 ตัวอักษร |
| `ENCRYPTION_KEY` | จากขั้นที่ 1 | ห้ามเปลี่ยนภายหลังโดยไม่ทำ key rotation |
| `AUTH_SECRET` | ค่าใหม่ | ทุกคนจะถูก logout 1 ครั้ง |
| `DATABASE_URL` | รหัสผ่าน DB ใหม่ (ขั้นที่ 5) | |
| `PUBLIC_SHOWCASE_WORKSPACE_IDS` | id ของ workspace ที่อยากโชว์หน้าแรก คั่นด้วย `,` | ถ้าว่าง = โชว์ทุก workspace เหมือนเดิม |

## ขั้นที่ 3 — อัปเดตสคริปต์ cron บน VPS ให้ส่ง secret
```powershell
cd C:\atgv\content_project\scripts\ops
$env:VPS_PASSWORD = "<รหัส root VPS>"     # หรือเปลี่ยนเป็น SSH key ตามขั้นที่ 5
$env:CRON_SECRET  = "<ค่าเดียวกับใน Coolify>"
python setup_cron.py
```
สคริปต์จะเขียน `/etc/vibepost-cron.env` (chmod 600) และอัปเดต `/usr/local/bin/vibepost-publisher.sh` ให้ส่ง `Authorization: Bearer ...`

## ขั้นที่ 4 — Deploy แล้วเข้ารหัสข้อมูลเดิม
1. **สำรองฐานข้อมูลก่อน** (`pg_dump`)
2. Deploy โค้ดใหม่ใน Coolify
3. รันการเข้ารหัสข้อมูลเดิม (ใช้ DATABASE_URL + ENCRYPTION_KEY ของ production):
```powershell
$env:DATABASE_URL   = "<production url>"
$env:ENCRYPTION_KEY = "<ค่าเดียวกับใน Coolify>"
npx tsx scripts/encrypt-existing-secrets.ts          # dry run ดูจำนวนก่อน
npx tsx scripts/encrypt-existing-secrets.ts --apply  # เข้ารหัสจริง (รันซ้ำได้ ปลอดภัย)
```
4. ตรวจ: หน้า Monitor/Automation → กด Trigger → log ต้องเป็น `success` ไม่ใช่ 401/503

> ลำดับสำคัญ: deploy ก่อนแล้วค่อย `--apply` — โค้ดใหม่อ่านได้ทั้งค่าเดิม (plaintext) และค่าที่เข้ารหัส แต่โค้ดเก่าอ่านค่าที่เข้ารหัสไม่ได้

## ขั้นที่ 5 — เปลี่ยน Secret ที่หลุดแล้ว
`env_deploy.txt` (DATABASE_URL + AUTH_SECRET) และ `app.zip` เคยถูก commit และ push ขึ้น GitHub — ถือว่าหลุดแล้ว
- [ ] เปลี่ยนรหัสผ่าน PostgreSQL user `admin` แล้วอัปเดต `DATABASE_URL` ใน Coolify
- [ ] เปลี่ยน `AUTH_SECRET` (ขั้นที่ 2)
- [ ] เปลี่ยนรหัสผ่าน root ของ VPS → ตั้ง SSH key แล้วปิด `PasswordAuthentication` ใน `/etc/ssh/sshd_config`
- [ ] เปลี่ยนรหัสผ่าน `admin@content.com` เป็นรหัสยาวแบบสุ่ม
- [ ] ออก Access Token ของ Facebook/IG/TikTok/YouTube และ API key AI ใหม่ แล้วใส่ผ่านหน้าเว็บ (จะถูกเข้ารหัสอัตโนมัติ)
- [ ] ตรวจว่า repo `github.com/isarachootip/vibepost` เป็น **Private**

## ขั้นที่ 6 — ลบไฟล์ลับออกจาก git history (คุณรันเอง)
ไฟล์ถูกเอาออกจาก index แล้ว (`git rm --cached`) แต่ยังอยู่ใน history
```powershell
pip install git-filter-repo
cd C:\atgv\content_project
git filter-repo --invert-paths --path env_deploy.txt --path app.zip --force
git remote add origin https://github.com/isarachootip/vibepost.git   # filter-repo ลบ remote ออก
git push origin --force --all
```
> การ force push เขียนประวัติใหม่ — ทุกเครื่องที่ clone ไว้ต้อง clone ใหม่ และการลบจาก history **ไม่ได้ทำให้ secret ปลอดภัย** ต้องทำขั้นที่ 5 ด้วยเสมอ

## Key rotation (ภายหลัง)
ตั้ง `ENCRYPTION_KEY` ใหม่ + `ENCRYPTION_KEY_ID=k2` และย้าย key เดิมไป `ENCRYPTION_KEYS_OLD=k1:<base64 เดิม>` → ค่าใหม่ใช้ k2, ค่าเก่ายังอ่านได้
