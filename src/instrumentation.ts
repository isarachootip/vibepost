export async function register(): Promise<void> {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    const { ensureSchedulerStarted } = await import("./lib/services/scheduler.service");
    ensureSchedulerStarted();
  }
}
