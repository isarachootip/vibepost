import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { randomBytes } from "crypto";
import { requireCreator, authErrorResponse } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

// /app/uploads directory is created with nextjs:nodejs ownership via Dockerfile RUN command
// To make uploads persistent across deploys, mount a Coolify volume at /app/uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vibepost.online";
const MAX_BYTES = (Number(process.env.UPLOAD_MAX_MB) || 50) * 1024 * 1024;

/** Detect real file type from magic bytes — never trust the client-supplied MIME type. */
function sniffType(buf: Buffer): { ext: string; mime: string } | null {
  const hex = (start: number, len: number) => buf.subarray(start, start + len).toString("hex");
  const ascii = (start: number, len: number) => buf.subarray(start, start + len).toString("latin1");

  if (hex(0, 3) === "ffd8ff") return { ext: "jpg", mime: "image/jpeg" };
  if (hex(0, 8) === "89504e470d0a1a0a") return { ext: "png", mime: "image/png" };
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return { ext: "gif", mime: "image/gif" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (hex(0, 4) === "1a45dfa3") return { ext: "webm", mime: "video/webm" };
  if (ascii(4, 4) === "ftyp") {
    const brand = ascii(8, 4);
    if (brand === "qt  ") return { ext: "mov", mime: "video/quicktime" };
    return { ext: "mp4", mime: "video/mp4" };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    await requireCreator();
  } catch (e) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Max ${Math.round(MAX_BYTES / 1024 / 1024)}MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = sniffType(buffer);
    if (!detected) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, WEBP and MP4/WEBM/MOV videos are allowed." },
        { status: 400 }
      );
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Unguessable filename; extension comes from the detected type, not the client filename
    const uniqueName = `${Date.now()}-${randomBytes(12).toString("hex")}.${detected.ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);
    await writeFile(filePath, buffer);

    const publicUrl = `${PUBLIC_BASE_URL}/api/files/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueName,
      size: file.size,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
