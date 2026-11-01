import assert from "node:assert/strict";
import {
  containsNonLatinScript,
  stripMarkdownAndNoise,
  buildVisualExtractionPrompts,
  parseVisualPromptOutput,
  extractEnglishKeywords,
} from "../src/lib/services/visual-prompt.service";
import {
  synthesizeEnglishVisualPrompt,
  ensureEnglishMediaPrompt,
} from "../src/lib/services/media-translator.service";
import {
  extractVisualPromptSchema,
  generateImageInputSchema,
} from "../src/lib/validations/ai-media.schema";

const PAKNAM_ARTICLE = `**สำรวจมนต์เสน่ห์แห่งปากน้ำ: ประตูสู่ประวัติศาสตร์และธรรมชาติสมุทรปราการ**

จังหวัดสมุทรปราการ หรือที่คนส่วนใหญ่มักเรียกว่า "ปากน้ำ" เป็นหนึ่งในจุดหมายปลายทางที่เปี่ยมไปด้วยมนต์เสน่ห์อันเป็นเอกลักษณ์ ด้วยทำเลที่ตั้งบริเวณปากแม่น้ำเจ้าพระยา "พระสมุทรเจดีย์" สัญลักษณ์คู่บ้านคู่เมือง และ "เมืองโบราณ" พิพิธภัณฑ์กลางแจ้ง รวมถึง "พิพิธภัณฑ์ช้างเอราวัณ" #เที่ยวปากน้ำ #สมุทรปราการ`;

export async function runVisualPromptTests(): Promise<void> {
  // 1. Detect Thai / non-Latin vs English
  {
    assert.equal(containsNonLatinScript(PAKNAM_ARTICLE), true);
    assert.equal(containsNonLatinScript("เที่ยวปากน้ำ"), true);
    assert.equal(
      containsNonLatinScript(
        "Scenic aerial photography of Phra Samut Chedi riverside pagoda, Thailand, 8k!"
      ),
      false
    );
  }

  // 2. Strip markdown & hashtags cleanly
  {
    const cleaned = stripMarkdownAndNoise(PAKNAM_ARTICLE);
    assert.equal(cleaned.includes("**"), false);
    assert.equal(cleaned.includes("#เที่ยวปากน้ำ"), false);
    assert.equal(cleaned.includes("พระสมุทรเจดีย์"), true);
  }

  // 3. Build extraction prompt includes full landmarks and anti-portrait instruction
  {
    const prompts = buildVisualExtractionPrompts(PAKNAM_ARTICLE, "image", "photo");
    assert.ok(prompts.systemPrompt.toLowerCase().includes("english"));
    assert.ok(prompts.userPrompt.includes("พระสมุทรเจดีย์"));
    assert.ok(prompts.userPrompt.includes("เมืองโบราณ"));
  }

  // 4. Parse structured JSON (even wrapped in markdown code fences)
  {
    const raw = "```json\n" + JSON.stringify({
      visualPrompt:
        "Panoramic travel photography of Phra Samut Chedi white pagoda by the Chao Phraya River estuary in Paknam, Samut Prakan, Thailand, warm golden hour light",
      keywords: ["travel", "thailand", "pagoda", "river"],
      category: "travel",
    }) + "\n```";

    const parsed = parseVisualPromptOutput(raw);
    assert.ok(parsed.englishPrompt.includes("Phra Samut Chedi"));
    assert.deepEqual(parsed.keywords, ["travel", "thailand", "pagoda", "river"]);
    assert.equal(parsed.suggestedCategory, "travel");
  }

  // 5. Synthesize via LLM adapter when workspace has active LLM config
  {
    const result = await synthesizeEnglishVisualPrompt(
      { content: PAKNAM_ARTICLE, mediaType: "image", style: "photo" },
      {
        llmRunner: async () => ({
          text: JSON.stringify({
            visualPrompt:
              "Phra Samut Chedi riverside white stupa and Erawan three-headed elephant monument in Samut Prakan, Thailand, lush tropical scenery, natural daylight",
            keywords: ["thailand", "temple", "river", "landmark"],
            category: "travel",
          }),
          provider: "GEMINI",
          modelName: "gemini-2.5-flash",
          promptTokens: 180,
          completionTokens: 55,
          totalTokens: 235,
          estimatedCost: 0.00003,
        }),
        fallbackTranslator: async () => {
          throw new Error("Should not call fallback translator when LLM succeeds");
        },
      }
    );

    assert.equal(result.usedFallbackTranslator, false);
    assert.equal(containsNonLatinScript(result.englishPrompt), false);
    assert.ok(result.englishPrompt.includes("Samut Prakan"));
    assert.equal(result.suggestedCategory, "travel");
    assert.ok(result.keywords.includes("thailand"));
    assert.equal(result.usage?.provider, "GEMINI");
  }

  // 6. Synthesize falls back to free translator when NO LLM key or LLM fails
  {
    const result = await synthesizeEnglishVisualPrompt(
      { content: PAKNAM_ARTICLE, mediaType: "video" },
      {
        llmRunner: null, // Workspace has no LLM API key configured
        fallbackTranslator: async () =>
          "Explore the charm of Paknam gateway to history and nature Samut Prakan Chao Phraya River estuary Phra Samut Chedi Ancient City",
      }
    );

    assert.equal(result.usedFallbackTranslator, true);
    assert.equal(containsNonLatinScript(result.englishPrompt), false);
    assert.ok(result.englishPrompt.includes("Paknam"));
    assert.ok(result.keywords.length > 0);
    assert.equal(result.suggestedCategory, "travel");
  }

  // 7. Safety Net ensureEnglishMediaPrompt: skips network if already pure English, translates if Thai
  {
    let translatorCalled = false;
    const englishReady = await ensureEnglishMediaPrompt(
      "Cinematic view of Ancient City Muang Boran pavilion reflected in lotus pond, Thailand",
      {
        llmRunner: null,
        fallbackTranslator: async () => {
          translatorCalled = true;
          return "";
        },
      }
    );
    assert.equal(translatorCalled, false);
    assert.ok(englishReady.englishPrompt.includes("Ancient City"));
    assert.ok(englishReady.keywords.includes("ancient"));

    const thaiDirect = await ensureEnglishMediaPrompt(
      "ทะเลบางปู นกนางนวลบินยามพระอาทิตย์ตกดิน",
      {
        llmRunner: null,
        fallbackTranslator: async () =>
          "Bang Pu seaside with seagulls flying at sunset over the ocean",
      }
    );
    assert.equal(containsNonLatinScript(thaiDirect.englishPrompt), false);
    assert.ok(thaiDirect.englishPrompt.includes("Bang Pu"));
    assert.ok(thaiDirect.keywords.includes("seagulls") || thaiDirect.keywords.includes("sunset"));
  }

  // 8. Keyword extraction filters stop-words & style noise for LoremFlickr / Pexels stock matching
  {
    const kw = extractEnglishKeywords(
      "High resolution cinematic photo of stunning Thai seafood river restaurant in Paknam"
    );
    assert.equal(kw.includes("high"), false);
    assert.equal(kw.includes("cinematic"), false);
    assert.ok(kw.includes("thai") || kw.includes("seafood"));
  }

  // 9. Zod schema validation
  {
    const invalid = extractVisualPromptSchema.safeParse({
      content: "   ",
      mediaType: "image",
    });
    assert.equal(invalid.success, false);

    const validImg = generateImageInputSchema.safeParse({
      prompt: "Phra Samut Chedi pagoda by the river",
      style: "photo",
      provider: "FREE",
    });
    assert.equal(validImg.success, true);
  }

  console.log("  ✓ visual-prompt.test.ts passed (9 assertions)");
}
