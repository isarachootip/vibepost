import { NextResponse } from "next/server";
import { executeAutoPost } from "@/lib/services/publisher";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn("CRON_SECRET is not set in environment variables. Running insecurely (NOT RECOMMENDED for production).");
    } else {
      // Validate Bearer token
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Execute the sweep
    const result = await executeAutoPost();

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Sweep completed successfully. Processed ${result.count} posts.`,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[Cron API] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
