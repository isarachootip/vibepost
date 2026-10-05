import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { executeAutoPost } from "@/lib/services/publisher";

export const dynamic = "force-dynamic";

function isAuthorized(header: string | null, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  // Fail closed: never run the publisher without a configured secret
  if (!cronSecret || cronSecret.length < 16) {
    console.error("[Cron API] CRON_SECRET is missing or too short — refusing to run.");
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }

  if (!isAuthorized(request.headers.get("authorization"), cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await executeAutoPost();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Sweep completed successfully. Processed ${result.count} posts.`,
        timestamp: new Date().toISOString(),
      });
    }
    return NextResponse.json(
      { success: false, error: result.error, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Cron API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
