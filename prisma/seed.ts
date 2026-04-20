import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  console.log("Seeding database...")

  const passwordHash = await bcrypt.hash("password123", 10)

  // Upsert the Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@content.com" },
    update: {},
    create: {
      email: "admin@content.com",
      passwordHash: passwordHash,
      name: "System Admin",
      role: "ADMIN",
    },
  })
  console.log("Created Admin User:", admin.email)

  // Ensure Admin has a Workspace
  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: admin.id }
  })

  if (!workspace) {
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: "Main Workspace",
        ownerId: admin.id,
      }
    })

    await prisma.workspaceMember.create({
      data: {
        userId: admin.id,
        workspaceId: newWorkspace.id,
      }
    })
    console.log("Created default Workspace:", newWorkspace.name)
  }

  console.log("Database seeded successfully!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
