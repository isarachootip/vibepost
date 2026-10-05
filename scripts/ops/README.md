# scripts/ops — สคริปต์ดูแลเซิร์ฟเวอร์ (ไม่ถูก commit: *.py อยู่ใน .gitignore)

ทุกสคริปต์อ่านค่าลับจาก environment variable เท่านั้น ห้ามฝังรหัสผ่านในไฟล์

| ตัวแปร | ใช้ใน |
|---|---|
| `VPS_PASSWORD` | ทุกสคริปต์ที่ SSH เข้า VPS (ควรเปลี่ยนเป็น SSH key) |
| `DB_PASSWORD` | สคริปต์ที่รัน `psql` (check_*, clean_db, reset_failed, migrate_roles) |
| `CRON_SECRET` | `setup_cron.py` — ต้องตรงกับค่าใน Coolify |
| `AUTH_SECRET`, `DATABASE_URL` | `remote_exec.py` |

ตัวอย่าง (PowerShell):
```powershell
$env:VPS_PASSWORD="..."; $env:CRON_SECRET="..."; python setup_cron.py
```
ดูขั้นตอน deploy ทั้งหมดที่ `docs/SECRET_ROTATION.md`
