"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function getUserWorkspaces() {
  const session = await auth()
  
  let userId = session?.user?.id
  if (!userId && session?.user?.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (dbUser) userId = dbUser.id
  }
  
  if (!userId) return []

  const members = await prisma.workspaceMember.findMany({
    where: { userId: userId },
    include: {
      workspace: true
    },
    orderBy: { joinedAt: 'asc' }
  })

  return members.map(m => m.workspace)
}

export async function getActiveWorkspaceContext() {
  const session = await auth()
  
  let userId = session?.user?.id
  if (!userId && session?.user?.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (dbUser) userId = dbUser.id
  }
  
  if (!userId) return null

  // Check cookie for active workspace
  const cookieStore = await cookies();
  const activeId = cookieStore.get("activeWorkspaceId")?.value;

  let whereClause: any = { userId: userId }
  if (activeId) {
    whereClause.workspaceId = activeId
  }

  // Fetch the active workspace or fallback to the first one
  let member = await prisma.workspaceMember.findFirst({
    where: whereClause,
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

  // Fallback if the cookie ID was invalid or user lost access
  if (!member && activeId) {
    member = await prisma.workspaceMember.findFirst({
      where: { userId: userId },
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
  }

  return member?.workspace || null
}

export async function createDefaultWorkspace(userId: string) {
  if (!userId) throw new Error("No user ID provided")

  const existing = await prisma.workspaceMember.findFirst({
    where: { userId: userId }
  })
  
  if (!existing) {
    const ws = await prisma.workspace.create({
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
    const cookieStore = await cookies();
    cookieStore.set("activeWorkspaceId", ws.id)
  }

  revalidatePath("/dashboard")
}

export async function switchActiveWorkspace(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set("activeWorkspaceId", workspaceId)
  revalidatePath("/dashboard")
}

export async function createNewWorkspace(name: string) {
  const session = await auth()
  
  let userId = session?.user?.id
  if (!userId && session?.user?.email) {
    const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (dbUser) userId = dbUser.id
  }
  
  if (!userId) throw new Error("Unauthorized")

  const ws = await prisma.workspace.create({
    data: {
      name: name,
      ownerId: userId,
      members: {
        create: {
          userId: userId
        }
      }
    }
  })

  const cookieStore = await cookies();
  cookieStore.set("activeWorkspaceId", ws.id)
  revalidatePath("/dashboard")
  return ws
}
