import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./lib/prisma"
import bcrypt from "bcryptjs"
import { isRateLimited, recordFailure, clearFailures } from "./lib/rate-limit"

const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000
// Used so unknown emails cost the same bcrypt time as known ones
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-not-a-real-password", 10)

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Brute-force protection: 5 failed attempts per email+IP per 15 minutes
        const email = String(credentials.email).trim().toLowerCase()
        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request?.headers?.get("x-real-ip") ||
          "unknown"
        const limitKey = `login:${email}:${ip}`
        if (isRateLimited(limitKey, LOGIN_MAX_ATTEMPTS)) {
          console.warn(`[auth] login rate-limited for ${email}`)
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        // Always run bcrypt to keep timing similar whether or not the user exists
        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user?.passwordHash ?? DUMMY_HASH
        )

        if (!user || !passwordsMatch) {
          recordFailure(limitKey, LOGIN_WINDOW_MS)
          return null
        }

        clearFailures(limitKey)
        if (passwordsMatch) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }

        return null
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as unknown as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id as string
          ;(session.user as unknown as { role: string }).role = token.role as string
        }
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
})
