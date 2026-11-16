import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, authErrorResponse } from "@/lib/auth-guard";
import { automationActionSchema } from "@/lib/validations/automation.schema";
import {
  ensureSchedulerStarted,
  getAutoPostScheduler,
} from "@/lib/services/scheduler.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSuperAdmin();
  } catch (e: unknown) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    ensureSchedulerStarted();
    const status = getAutoPostScheduler().getStatus();
    return NextResponse.json(status);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load automation status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
  } catch (e: unknown) {
    return authErrorResponse(e) ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw: unknown = await request.json();
    const parsed = automationActionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid action payload" },
        { status: 400 }
      );
    }

    const scheduler = getAutoPostScheduler();
    const payload = parsed.data;

    if (payload.action === "trigger") {
      const result = await scheduler.triggerManual();
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error ?? "Publisher execution failed" },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Publisher triggered",
        count: result.count ?? 0,
      });
    }

    if (payload.action === "update") {
      scheduler.updateInterval(payload.intervalMinutes);
      return NextResponse.json({
        success: true,
        intervalMinutes: payload.intervalMinutes,
      });
    }

    scheduler.disable();
    return NextResponse.json({ success: true, message: "Cron disabled" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Automation request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
