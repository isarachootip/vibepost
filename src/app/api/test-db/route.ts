import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt to connect and fetch data
    const users = await prisma.user.findMany();
    const workspaces = await prisma.workspace.findMany();

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Hostinger PostgreSQL Database! 🎉",
      data: {
        totalUsers: users.length,
        totalWorkspaces: workspaces.length,
      }
    });

  } catch (error: any) {
    console.error("Database connection failed:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to connect to the database.",
      error: error.message
    }, { status: 500 });
  }
}
