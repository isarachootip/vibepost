import { PrismaClient } from "@prisma/client"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { encryptSecret, decryptSecret } from "./crypto"

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

/* ------------------------------------------------------------------ */
/* Transparent encryption of secret columns                            */
/*   SocialConnection.accessToken / refreshToken, PromptConfig.apiKey  */
/* Writes are encrypted, reads are decrypted (server-side only).       */
/* NOTE: nested writes (e.g. workspace.create({ socialConnections:     */
/* { create } })) are NOT intercepted — always write these models      */
/* directly.                                                           */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>

function encryptFields(data: unknown, fields: readonly string[]) {
  if (!data) return
  const rows = (Array.isArray(data) ? data : [data]) as Row[]
  for (const row of rows) {
    for (const f of fields) {
      const v = row[f]
      if (typeof v === "string") {
        row[f] = encryptSecret(v)
      } else if (v && typeof v === "object" && typeof (v as Row).set === "string") {
        ;(v as Row).set = encryptSecret((v as Row).set as string)
      }
    }
  }
}

const SOCIAL_FIELDS = ["accessToken", "refreshToken"] as const
const PROMPT_FIELDS = ["apiKey"] as const

function writeHooks(fields: readonly string[]) {
  return {
    async create({ args, query }: { args: { data: unknown }; query: (a: never) => Promise<unknown> }) {
      encryptFields(args.data, fields)
      return query(args as never)
    },
    async createMany({ args, query }: { args: { data: unknown }; query: (a: never) => Promise<unknown> }) {
      encryptFields(args.data, fields)
      return query(args as never)
    },
    async update({ args, query }: { args: { data: unknown }; query: (a: never) => Promise<unknown> }) {
      encryptFields(args.data, fields)
      return query(args as never)
    },
    async updateMany({ args, query }: { args: { data: unknown }; query: (a: never) => Promise<unknown> }) {
      encryptFields(args.data, fields)
      return query(args as never)
    },
    async upsert({ args, query }: { args: { create: unknown; update: unknown }; query: (a: never) => Promise<unknown> }) {
      encryptFields(args.create, fields)
      encryptFields(args.update, fields)
      return query(args as never)
    },
  }
}

function createPrismaClient() {
  return new PrismaClient({ adapter }).$extends({
    query: {
      socialConnection: writeHooks(SOCIAL_FIELDS),
      promptConfig: writeHooks(PROMPT_FIELDS),
    },
    result: {
      socialConnection: {
        accessToken: {
          needs: { accessToken: true },
          compute: (c) => decryptSecret(c.accessToken),
        },
        refreshToken: {
          needs: { refreshToken: true },
          compute: (c) => decryptSecret(c.refreshToken),
        },
      },
      promptConfig: {
        apiKey: {
          needs: { apiKey: true },
          compute: (c) => decryptSecret(c.apiKey),
        },
      },
    },
  })
}

export type AppPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as unknown as { prisma?: AppPrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
