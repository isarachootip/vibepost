import { runScheduleTimeTests } from "./schedule-time.test";
import { runVisualPromptTests } from "./visual-prompt.test";
import { runImageProviderTests } from "./image-provider.test";
import { runPlannerSchemaTests } from "./planner-schema.test";
import { runCampaignStatusTests } from "./campaign-status.test";
import { runPlannerOverviewTests } from "./planner-overview.test";
import { runGeminiClientTests } from "./gemini-client.test";
import { runPublisherSweepTests } from "./publisher-sweep.test";
import { runVeoFlowTests } from "./veo-flow.test";
import { runShowcaseCurationTests } from "./showcase-curation.test";

async function main(): Promise<void> {
  console.log("Running test suite...");
  await runScheduleTimeTests();
  await runVisualPromptTests();
  await runImageProviderTests();
  await runPlannerSchemaTests();
  await runCampaignStatusTests();
  await runPlannerOverviewTests();
  await runGeminiClientTests();
  await runPublisherSweepTests();
  await runVeoFlowTests();
  await runShowcaseCurationTests();
  console.log("All tests passed!");
}

main().catch((err: unknown) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
