import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";
const execAsync = promisify(exec);

export async function GET() {
  try {
    // Read current crontab
    let cronEntry = "";
    let intervalMinutes = 5;
    let isActive = false;

    try {
      const { stdout } = await execAsync("ssh -o StrictHostKeyChecking=no -i /root/.ssh/id_rsa root@127.0.0.1 crontab -l 2>/dev/null || true");
      cronEntry = stdout;
    } catch {}

    // Parse the cron entry
    const match = cronEntry.match(/\*\/(\d+) \* \* \* \* .*vibepost-publisher/);
    if (match) {
      intervalMinutes = parseInt(match[1]);
      isActive = true;
    }

    // Get last 20 lines of log
    let recentLogs: string[] = [];
    const logPath = "/var/log/vibepost-publisher.log";
    if (existsSync(logPath)) {
      const logContent = await readFile(logPath, "utf-8");
      recentLogs = logContent.trim().split("\n").slice(-20).reverse();
    }

    return NextResponse.json({
      isActive,
      intervalMinutes,
      recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intervalMinutes, action } = body;

    if (action === "trigger") {
      // Manual trigger
      try {
        const { stdout } = await execAsync("bash /usr/local/bin/vibepost-publisher.sh 2>&1");
        return NextResponse.json({ success: true, message: "Publisher triggered", output: stdout });
      } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
      }
    }

    if (action === "update" && intervalMinutes) {
      const minutes = Math.max(1, Math.min(60, parseInt(intervalMinutes)));
      const cronLine = `*/${minutes} * * * * /usr/local/bin/vibepost-publisher.sh >> /var/log/vibepost-publisher.log 2>&1`;
      
      try {
        await execAsync(
          `(crontab -l 2>/dev/null | grep -v vibepost-publisher; echo '${cronLine}') | crontab -`
        );
        return NextResponse.json({ success: true, intervalMinutes: minutes });
      } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
      }
    }

    if (action === "disable") {
      try {
        await execAsync("crontab -l 2>/dev/null | grep -v vibepost-publisher | crontab -");
        return NextResponse.json({ success: true, message: "Cron disabled" });
      } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
