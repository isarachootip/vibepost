export async function register(): Promise<void> {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    const [{ ensureSchedulerStarted }, { ensureVeoBackgroundPollerStarted }] =
      await Promise.all([
        import("./lib/services/scheduler.service"),
        import("./lib/services/veo-job-runner.service"),
      ]);
    ensureSchedulerStarted();
    ensureVeoBackgroundPollerStarted();
  }
}
