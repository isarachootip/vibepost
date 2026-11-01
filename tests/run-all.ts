import { runScheduleTimeTests } from "./schedule-time.test";
import { runVisualPromptTests } from "./visual-prompt.test";
import { runImageProviderTests } from "./image-provider.test";

async function main(): Promise<void> {
  console.log("Running test suite...");
  await runScheduleTimeTests();
  await runVisualPromptTests();
  await runImageProviderTests();
  console.log("All tests passed!");
}

main().catch((err: unknown) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
