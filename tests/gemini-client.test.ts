import assert from "node:assert/strict";
import {
  runGeminiContentWithFallback,
  generateGeminiImageWithFallback,
  GEMINI_TEXT_MODELS,
} from "../src/lib/services/gemini-client.service";

export async function runGeminiClientTests(): Promise<void> {
  // 1. Model list prioritizes new-key-compatible 3.x models before legacy 2.5
  assert.equal(GEMINI_TEXT_MODELS[0], "gemini-3.1-flash-lite");
  assert.ok(GEMINI_TEXT_MODELS.includes("gemini-2.5-flash"));

  // 2. Skips thought parts and concatenates visible text parts; falls over on 404
  {
    const tried: string[] = [];
    const mockFetch = (async (url: string | URL | Request) => {
      const u = String(url);
      tried.push(u);
      if (u.includes("gemini-3.1-flash-lite")) {
        return new Response(
          JSON.stringify({ error: { status: "NOT_FOUND", message: "model not found" } }),
          { status: 404 }
        );
      }
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  { thought: true, text: "internal reasoning..." },
                  { text: "สวัสดีครับ " },
                  { text: "ยินดีให้บริการ" },
                ],
              },
            },
          ],
          usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 8, totalTokenCount: 20 },
        }),
        { status: 200 }
      );
    }) as typeof fetch;

    const res = await runGeminiContentWithFallback({
      apiKey: "test-key",
      parts: [{ text: "hello" }],
      fetchFn: mockFetch,
    });

    assert.equal(tried.length, 2);
    assert.equal(res.text, "สวัสดีครับ ยินดีให้บริการ");
    assert.equal(res.model, GEMINI_TEXT_MODELS[1]);
    assert.equal(res.promptTokens, 12);
    assert.equal(res.completionTokens, 8);
    assert.equal(res.totalTokens, 20);
  }

  // 3. Preserves primary quota error (429) instead of overwriting with trailing 404
  {
    const mockFetch = (async (url: string | URL | Request) => {
      const u = String(url);
      if (u.includes("gemini-2.5-flash")) {
        return new Response(
          JSON.stringify({
            error: { status: "NOT_FOUND", message: "no longer available to new users" },
          }),
          { status: 404 }
        );
      }
      return new Response(
        JSON.stringify({
          error: { status: "RESOURCE_EXHAUSTED", message: "Quota exceeded for free tier" },
        }),
        { status: 429 }
      );
    }) as typeof fetch;

    await assert.rejects(
      () =>
        runGeminiContentWithFallback({
          apiKey: "test-key",
          parts: [{ text: "hello" }],
          fetchFn: mockFetch,
        }),
      (err: unknown) =>
        err instanceof Error &&
        err.message.includes("Quota exceeded for free tier") &&
        !err.message.includes("no longer available")
    );
  }

  // 4. Fails fast on invalid API key (400 API_KEY_INVALID) without trying remaining models
  {
    let calls = 0;
    const mockFetch = (async () => {
      calls++;
      return new Response(
        JSON.stringify({
          error: { status: "INVALID_ARGUMENT", message: "API key not valid. Please pass a valid API key." },
        }),
        { status: 400 }
      );
    }) as typeof fetch;

    await assert.rejects(
      () =>
        runGeminiContentWithFallback({
          apiKey: "bad-key",
          parts: [{ text: "hello" }],
          fetchFn: mockFetch,
        }),
      /API key not valid/
    );
    assert.equal(calls, 1);
  }

  // 5. Image generation succeeds via gemini-3.1-flash-image inlineData
  {
    const res = await generateGeminiImageWithFallback({
      apiKey: "paid-key",
      prompt: "A clean studio photo of a car tire",
      fetchFn: (async () =>
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ inlineData: { mimeType: "image/png", data: "BASE64_IMAGE_BYTES" } }],
                },
              },
            ],
          }),
          { status: 200 }
        )) as typeof fetch,
    });

    assert.equal(res.base64Bytes, "BASE64_IMAGE_BYTES");
    assert.equal(res.model, "gemini-3.1-flash-image");
  }

  console.log("  ✓ gemini-client.test.ts passed (5 assertions)");
}
