"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

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
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existing = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id }
  })
  if (existing) return existing.workspaceId

  const workspace = await prisma.workspace.create({
    data: {
      name: "Main Workspace",
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id
        }
      }
    }
  })

  revalidatePath("/dashboard")
  return workspace.id
}
