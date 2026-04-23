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

export async function createDefaultWorkspace(userId: string) {
  if (!userId) throw new Error("No user ID provided")

  const existing = await prisma.workspaceMember.findFirst({
    where: { userId: userId }
  })
  
  if (!existing) {
    await prisma.workspace.create({
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
  }

  revalidatePath("/dashboard")
}
