"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getActiveWorkspaceContext() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Fetch the first workspace the user is a member of (can be scaled to switchable later)
  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          socialConnections: true,
          promptConfigs: true,
          _count: {
            select: { posts: true, mediaAssets: true, members: true }
          }
        }
      }
    }
  })

  return member?.workspace || null
}

export async function createDefaultWorkspace() {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Unauthorized (No Session)" }

    let userId = session.user.id
    if (!userId && session.user.email) {
       const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
       if (dbUser) userId = dbUser.id
    }

    if (!userId) return { error: `Unauthorized (No User ID found). Session: ${JSON.stringify(session)}` }

    const existing = await prisma.workspaceMember.findFirst({
      where: { userId: userId }
    })
    if (existing) {
      return { success: true }
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: "Main Workspace",
        ownerId: userId,
        members: {
          create: {
            userId: userId
          }
        }
      }
    })

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Workspace creation failed:", error)
    return { error: error.message || "Failed to create workspace" }
  }
}
