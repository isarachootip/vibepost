/**
 * One-off, idempotent migration: encrypt existing plaintext secrets in the DB.
 *
 *   Usage (with DATABASE_URL and ENCRYPTION_KEY set to the PRODUCTION values):
 *     npx tsx scripts/encrypt-existing-secrets.ts            # dry run — shows counts only
 *     npx tsx scripts/encrypt-existing-secrets.ts --apply    # writes changes
 *
 * Safe to run multiple times: values already prefixed "enc:v1:" are skipped.
 * Back up the database first.
 */
import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { encryptSecret, isEncrypted, decryptSecret } from "../src/lib/crypto"

async function main() {
  const apply = process.argv.includes("--apply")
  if (!process.env.ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY is not set")
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")

  // Raw client (no encryption extension) so we see stored values as-is
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const db = new PrismaClient({ adapter: new PrismaPg(pool) })

  let social = 0
  let prompt = 0

  const conns = await db.socialConnection.findMany({
    select: { id: true, accessToken: true, refreshToken: true },
  })
  for (const c of conns) {
    const data: { accessToken?: string; refreshToken?: string } = {}
    if (c.accessToken && !isEncrypted(c.accessToken)) data.accessToken = encryptSecret(c.accessToken)
    if (c.refreshToken && !isEncrypted(c.refreshToken)) data.refreshToken = encryptSecret(c.refreshToken)
    if (Object.keys(data).length) {
      social++
      if (data.accessToken && decryptSecret(data.accessToken) !== c.accessToken) {
        throw new Error(`Round-trip check failed for SocialConnection ${c.id}`)
      }
      if (apply) await db.socialConnection.update({ where: { id: c.id }, data })
    }
  }

  const configs = await db.promptConfig.findMany({ select: { id: true, apiKey: true } })
  for (const p of configs) {
    if (p.apiKey && !isEncrypted(p.apiKey)) {
      prompt++
      const enc = encryptSecret(p.apiKey)
      if (decryptSecret(enc) !== p.apiKey) throw new Error(`Round-trip check failed for PromptConfig ${p.id}`)
      if (apply) await db.promptConfig.update({ where: { id: p.id }, data: { apiKey: enc } })
    }
  }

  console.log(
    `${apply ? "Encrypted" : "[dry run] Would encrypt"}: ${social} SocialConnection row(s), ${prompt} PromptConfig row(s).`
  )
  await db.$disconnect()
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
