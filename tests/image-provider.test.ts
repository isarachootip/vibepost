import assert from "node:assert/strict";
import { executeImageGeneration } from "../src/lib/services/image-provider.service";

export async function runImageProviderTests(): Promise<void> {
  // 1. Primary GEMINI fails -> falls back to Pollinations with English prompt & sets usedFallback = true
  {
    let capturedUrl = "";
    const res = await executeImageGeneration(
      {
        englishPrompt: "Phra Samut Chedi riverside white pagoda in Samut Prakan Thailand",
        keywords: ["thailand", "pagoda", "river"],
        style: "photo",
        requestedProvider: "GEMINI",
        geminiApiKey: "fake-gemini-key",
        openaiApiKey: null,
      },
      {
        fetchFn: (async () =>
          new Response(JSON.stringify({ error: { message: "Imagen billing required" } }), {
            status: 403,
          })) as typeof fetch,
        saveBase64Jpg: async () => "https://vibepost.online/api/files/gemini.jpg",
        downloadRemoteJpg: async (url: string) => {
          capturedUrl = url;
          return "https://vibepost.online/api/files/pollinations.jpg";
        },
      }
    );

    assert.equal(res.imageUrl, "https://vibepost.online/api/files/pollinations.jpg");
    assert.equal(res.meta.usedFallback, true);
    assert.equal(res.meta.actualProvider, "FREE");
    assert.equal(res.meta.actualModel, "pollinations.ai");
    assert.ok(res.meta.fallbackReason && res.meta.fallbackReason.length > 0);
    assert.ok(capturedUrl.includes("image.pollinations.ai/prompt/"));
    assert.ok(capturedUrl.includes("Phra%20Samut%20Chedi"));
  }

  // 2. Pollinations ALSO fails -> falls back to LoremFlickr using English keywords (NOT business,marketing)
  {
    let attempt = 0;
    let loremUrl = "";
    const res = await executeImageGeneration(
      {
        englishPrompt: "Phra Samut Chedi riverside white pagoda in Samut Prakan Thailand",
        keywords: ["thailand", "pagoda", "river"],
        style: "photo",
        requestedProvider: "FREE",
        geminiApiKey: null,
        openaiApiKey: null,
      },
      {
        fetchFn: fetch,
        saveBase64Jpg: async () => "",
        downloadRemoteJpg: async (url: string) => {
          attempt++;
          if (attempt === 1) {
            throw new Error("Pollinations 429 rate limited");
          }
          loremUrl = url;
          return "https://vibepost.online/api/files/lorem.jpg";
        },
      }
    );

    assert.equal(res.imageUrl, "https://vibepost.online/api/files/lorem.jpg");
    assert.equal(res.meta.usedFallback, true);
    assert.equal(res.meta.actualModel, "loremflickr");
    assert.ok(loremUrl.includes("thailand,pagoda,river"));
    assert.equal(loremUrl.includes("business,marketing"), false);
  }

  // 3. GEMINI succeeds with new gemini-3.1-flash-image inlineData response
  {
    let savedBytes = "";
    const res = await executeImageGeneration(
      {
        englishPrompt: "Car battery studio shot",
        keywords: ["battery", "car"],
        style: "photo",
        requestedProvider: "GEMINI",
        geminiApiKey: "valid-paid-key",
        openaiApiKey: null,
      },
      {
        fetchFn: (async () =>
          new Response(
            JSON.stringify({
              candidates: [
                {
                  content: {
                    parts: [{ inlineData: { mimeType: "image/jpeg", data: "IMG_B64" } }],
                  },
                },
              ],
            }),
            { status: 200 }
          )) as typeof fetch,
        saveBase64Jpg: async (b64: string) => {
          savedBytes = b64;
          return "https://vibepost.online/api/files/gemini-31.jpg";
        },
        downloadRemoteJpg: async () => "https://vibepost.online/api/files/unused.jpg",
      }
    );

    assert.equal(savedBytes, "IMG_B64");
    assert.equal(res.imageUrl, "https://vibepost.online/api/files/gemini-31.jpg");
    assert.equal(res.meta.usedFallback, false);
    assert.equal(res.meta.actualProvider, "GEMINI");
    assert.equal(res.meta.actualModel, "gemini-3.1-flash-image");
  }

  console.log("  ✓ image-provider.test.ts passed (3 assertions)");
}
