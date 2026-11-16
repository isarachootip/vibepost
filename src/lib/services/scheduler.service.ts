import type { ExecuteAutoPostResult } from "./publisher-types";

const MAX_RECENT_LOGS = 50;
const DEFAULT_INTERVAL_MINUTES = 5;

export interface SchedulerStatus {
  isActive: boolean;
  intervalMinutes: number;
  recentLogs: string[];
}

export interface SchedulerController {
  start: () => void;
  updateInterval: (minutes: number) => void;
  disable: () => void;
  triggerManual: () => Promise<ExecuteAutoPostResult>;
  getStatus: () => SchedulerStatus;
}

type SweepRunner = () => Promise<ExecuteAutoPostResult>;

export function createSchedulerController(runSweep: SweepRunner): SchedulerController {
  let isActive = true;
  let intervalMinutes = DEFAULT_INTERVAL_MINUTES;
  let timer: ReturnType<typeof setInterval> | null = null;
  let inFlight = false;
  let started = false;
  const recentLogs: string[] = [];

  const appendLog = (entry: string) => {
    recentLogs.unshift(`[${new Date().toISOString()}] ${entry}`);
    if (recentLogs.length > MAX_RECENT_LOGS) {
      recentLogs.length = MAX_RECENT_LOGS;
    }
  };

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const executeGuarded = async (source: "Auto" | "Manual"): Promise<ExecuteAutoPostResult> => {
    if (inFlight) {
      appendLog(`${source} sweep skipped — previous sweep still running.`);
      return { success: true, count: 0 };
    }
    inFlight = true;
    try {
      const res = await runSweep();
      if (res.success) {
        appendLog(`${source} sweep OK — Processed ${res.count ?? 0} posts.`);
      } else {
        appendLog(`ERROR (${source}): ${res.error || "Unknown error"}`);
      }
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      appendLog(`ERROR (${source}): ${msg}`);
      return { success: false, error: msg };
    } finally {
      inFlight = false;
    }
  };

  const armTimer = () => {
    clearTimer();
    if (!isActive) return;
    const ms = intervalMinutes * 60_000;
    timer = setInterval(() => {
      void executeGuarded("Auto");
    }, ms);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
  };

  return {
    start() {
      if (started) return;
      started = true;
      isActive = true;
      armTimer();
      appendLog(`Scheduler started (every ${intervalMinutes}m).`);
      const bootSweep = setTimeout(() => {
        if (isActive) void executeGuarded("Auto");
      }, 5_000);
      if (typeof bootSweep.unref === "function") {
        bootSweep.unref();
      }
    },

    updateInterval(minutes: number) {
      const clamped = Math.max(1, Math.min(60, Math.trunc(minutes)));
      intervalMinutes = clamped;
      isActive = true;
      started = true;
      armTimer();
      appendLog(`Interval updated to every ${intervalMinutes}m.`);
    },

    disable() {
      isActive = false;
      clearTimer();
      appendLog("Scheduler disabled.");
    },

    async triggerManual() {
      return executeGuarded("Manual");
    },

    getStatus() {
      return {
        isActive,
        intervalMinutes,
        recentLogs: [...recentLogs],
      };
    },
  };
}

const globalForScheduler = globalThis as unknown as {
  __vibepostScheduler?: SchedulerController;
};

export function getAutoPostScheduler(): SchedulerController {
  if (!globalForScheduler.__vibepostScheduler) {
    globalForScheduler.__vibepostScheduler = createSchedulerController(async () => {
      const { executeAutoPost } = await import("./publisher");
      return executeAutoPost();
    });
  }
  return globalForScheduler.__vibepostScheduler;
}

export function ensureSchedulerStarted(): void {
  getAutoPostScheduler().start();
}
