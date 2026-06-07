import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

// /app/uploads directory is created with nextjs:nodejs ownership via Dockerfile RUN command
// To make uploads persistent across deploys, mount a Coolify volume at /app/uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vibepost.online";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, WEBP allowed." },
        { status: 400 }
      );
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB." }, { status: 400 });
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return public URL
    const publicUrl = `${PUBLIC_BASE_URL}/api/files/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
      size: file.size,
    });
  } catch (error: any) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
