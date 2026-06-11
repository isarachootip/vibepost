"use server";

import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "./workspace";
import { getUserWorkspaceRole } from "./posts";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vibepost.online";

// Curated stunning high-definition stock video database
const CURATED_VIDEOS = [
  {
    id: "vid-cafe-1",
    title: "Latte Art Pouring",
    category: "coffee",
    tags: ["coffee", "cafe", "latte", "barista", "cup", "drink"],
    videoUrl: "https://images.pexels.com/video-files/3028989/3028989-hd_1920_1080_24fps.mp4",
    previewUrl: "https://images.pexels.com/photos/3028989/pexels-photo-3028989.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-cafe-2",
    title: "Espresso Brewing Close-up",
    category: "coffee",
    tags: ["coffee", "espresso", "barista", "machine", "brew", "cafe"],
    videoUrl: "https://images.pexels.com/video-files/855018/855018-hd_1920_1080_30fps.mp4",
    previewUrl: "https://images.pexels.com/photos/855018/pexels-photo-855018.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-cafe-3",
    title: "Cozy Coffee Shop",
    category: "coffee",
    tags: ["cafe", "cozy", "ambience", "coffee", "restaurant", "table"],
    videoUrl: "https://images.pexels.com/video-files/2906806/2906806-hd_1920_1080_24fps.mp4",
    previewUrl: "https://images.pexels.com/photos/2906806/pexels-photo-2906806.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-office-1",
    title: "Modern Office Workspace Collaboration",
    category: "business",
    tags: ["office", "business", "meeting", "team", "marketing", "collaboration", "work"],
    videoUrl: "https://images.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
    previewUrl: "https://images.pexels.com/photos/3129671/pexels-photo-3129671.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-office-2",
    title: "Typing on Laptop Keyboard",
    category: "business",
    tags: ["laptop", "type", "work", "coding", "business", "keyboard", "close-up"],
    videoUrl: "https://images.pexels.com/video-files/3130182/3130182-hd_1920_1080_30fps.mp4",
    previewUrl: "https://images.pexels.com/photos/3130182/pexels-photo-3130182.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-office-3",
    title: "Analytics Charts on Monitor",
    category: "business",
    tags: ["charts", "analytics", "dashboard", "business", "growth", "screen", "marketing"],
    videoUrl: "https://images.pexels.com/video-files/3130284/3130284-hd_1920_1080_30fps.mp4",
    previewUrl: "https://images.pexels.com/photos/3130284/pexels-photo-3130284.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-food-1",
    title: "Slicing Vegetables Chef",
    category: "cooking",
    tags: ["food", "cooking", "chef", "vegetables", "kitchen", "prep", "fresh"],
    videoUrl: "https://images.pexels.com/video-files/3753232/3753232-hd_1920_1080_24fps.mp4",
    previewUrl: "https://images.pexels.com/photos/3753232/pexels-photo-3753232.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-food-2",
    title: "Baking Pizza in Wood Fire Oven",
    category: "cooking",
    tags: ["pizza", "cooking", "oven", "fire", "food", "italian", "bake"],
    videoUrl: "https://images.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4",
    previewUrl: "https://images.pexels.com/photos/1448735/pexels-photo-1448735.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-tech-1",
    title: "Green Matrix Code on Screen",
    category: "technology",
    tags: ["code", "tech", "matrix", "programming", "monitor", "developer", "server"],
    videoUrl: "https://images.pexels.com/video-files/5319760/5319760-hd_1920_1080_25fps.mp4",
    previewUrl: "https://images.pexels.com/photos/5319760/pexels-photo-5319760.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-tech-2",
    title: "Cyberpunk Server Room Blinking Lights",
    category: "technology",
    tags: ["server", "tech", "hardware", "internet", "hosting", "cyber", "data"],
    videoUrl: "https://images.pexels.com/video-files/3129957/3129957-hd_1920_1080_25fps.mp4",
    previewUrl: "https://images.pexels.com/photos/3129957/pexels-photo-3129957.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-fitness-1",
    title: "Gym Dumbbell Lifting Workout",
    category: "fitness",
    tags: ["gym", "workout", "fitness", "dumbbell", "exercise", "lifting", "health"],
    videoUrl: "https://images.pexels.com/video-files/4754030/4754030-hd_1920_1080_25fps.mp4",
    previewUrl: "https://images.pexels.com/photos/4754030/pexels-photo-4754030.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-fitness-2",
    title: "Yoga Stretching home",
    category: "fitness",
    tags: ["yoga", "stretch", "fitness", "meditation", "home", "healthy", "exercise"],
    videoUrl: "https://images.pexels.com/video-files/4758532/4758532-hd_1920_1080_25fps.mp4",
    previewUrl: "https://images.pexels.com/photos/4758532/pexels-photo-4758532.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-travel-1",
    title: "Cinematic Beach Waves Drone Shot",
    category: "travel",
    tags: ["beach", "sea", "ocean", "waves", "drone", "travel", "summer", "nature"],
    videoUrl: "https://images.pexels.com/video-files/857112/857112-hd_1920_1080_30fps.mp4",
    previewUrl: "https://images.pexels.com/photos/857112/pexels-photo-857112.jpeg?auto=compress&cs=tinysrgb&w=300"
  },
  {
    id: "vid-travel-2",
    title: "Driving Through Scenic Mountains",
    category: "travel",
    tags: ["travel", "drive", "mountain", "road", "trip", "scenic", "nature"],
    videoUrl: "https://images.pexels.com/video-files/3209828/3209828-hd_1920_1080_25fps.mp4",
    previewUrl: "https://images.pexels.com/photos/3209828/pexels-photo-3209828.jpeg?auto=compress&cs=tinysrgb&w=300"
  }
];

/**
 * Downloads a remote file URL and saves it to the local UPLOAD_DIR.
 * Returns the public local URL.
 */
async function downloadAndSaveFile(fileUrl: string, extension: string): Promise<string> {
  // Ensure directory exists
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download remote file from ${fileUrl}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uniqueName = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);

  await writeFile(filePath, buffer);

  return `${PUBLIC_BASE_URL}/api/files/${uniqueName}`;
}

/**
 * Server Action: Generates an image using AI (Gemini, OpenAI, or Pollinations.ai)
 * and saves it locally.
 */
export async function generateAIImageAction(
  prompt: string,
  style: string = "photo",
  provider: "FREE" | "GEMINI" | "OPENAI" = "FREE"
) {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) return { success: false, error: "Workspace not found" };

    const role = await getUserWorkspaceRole(workspace.id);
    if (role === "VIEWER") {
      return { success: false, error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสร้างรูปได้" };
    }

    if (!prompt.trim()) {
      return { success: false, error: "โปรดป้อนรายละเอียดรูปภาพ (Prompt)" };
    }

    // Enhance prompt based on style
    const enhancedPrompt = `${prompt}, style: ${style}, high resolution, cinematic, stunning details`;

    let generatedImageUrl = "";
    let finalProvider = provider;
    let config = null;

    // Check if there is an active GEMINI key in this workspace
    const activeGeminiConfig = await prisma.promptConfig.findFirst({
      where: { workspaceId: workspace.id, provider: "GEMINI", isActive: true },
    });

    if (provider === "FREE" && activeGeminiConfig) {
      // Auto-upgrade FREE tier requests to GEMINI if an active key is found in the workspace
      finalProvider = "GEMINI";
      config = activeGeminiConfig;
    } else if (provider !== "FREE") {
      config = await prisma.promptConfig.findFirst({
        where: { workspaceId: workspace.id, provider: provider, isActive: true },
      });
      if (!config) {
        // Fallback to FREE if no key is configured
        finalProvider = "FREE";
      }
    }

    // Execute provider logic
    if (finalProvider !== "FREE" && config) {
      if (finalProvider === "GEMINI") {
        try {
          // Imagen 4.0 Fast via Google Gemini API
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${config.apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                instances: [
                  { prompt: enhancedPrompt }
                ],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: "1:1",
                  outputMimeType: "image/jpeg"
                }
              })
            }
          );
          const data = await response.json();
          if (!response.ok || !data.predictions?.[0]?.bytesBase64Encoded) {
            throw new Error(data.error?.message || "Gemini Imagen 4.0 API error");
          }
          // Gemini returns base64 image bytes
          const base64Bytes = data.predictions[0].bytesBase64Encoded;
          
          // Write to disk directly from base64
          if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true });
          }
          const uniqueName = `ai-img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpg`;
          const filePath = path.join(UPLOAD_DIR, uniqueName);
          await writeFile(filePath, Buffer.from(base64Bytes, "base64"));
          generatedImageUrl = `${PUBLIC_BASE_URL}/api/files/${uniqueName}`;
        } catch (e: any) {
          console.error("Gemini Imagen failed, falling back to Pollinations/LoremFlickr:", e.message);
          finalProvider = "FREE"; // fallback
        }
      } else if (finalProvider === "OPENAI") {
        try {
          // DALL-E 3
          const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${config.apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: enhancedPrompt,
              n: 1,
              size: "1024x1024"
            })
          });
          const data = await response.json();
          if (!response.ok || !data.data?.[0]?.url) {
            throw new Error(data.error?.message || "DALL-E API error");
          }
          generatedImageUrl = await downloadAndSaveFile(data.data[0].url, "jpg");
        } catch (e: any) {
          console.error("DALL-E failed, falling back to Pollinations/LoremFlickr:", e.message);
          finalProvider = "FREE"; // fallback
        }
      }
    }

    // Free stable diffusion fallback (Pollinations.ai / LoremFlickr)
    if (finalProvider === "FREE" || !generatedImageUrl) {
      try {
        const randomSeed = Math.floor(Math.random() * 1000000);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${randomSeed}&nologo=true&private=true`;
        
        generatedImageUrl = await downloadAndSaveFile(pollinationsUrl, "jpg");
      } catch (e: any) {
        console.error("Pollinations.ai failed (likely rate-limited), falling back to LoremFlickr:", e.message);
        
        // Clean prompt for loremflickr tags (comma-separated keywords)
        const tags = prompt
          .toLowerCase()
          .replace(/[^a-z0-9\s,]/g, "") // Keep only letters, numbers, spaces, and commas
          .split(/[\s,]+/) // Split by spaces or commas
          .filter(tag => tag.length > 2 && !["and", "the", "with", "for", "beautiful", "high", "resolution", "style", "photo", "cinematic", "stunning", "details"].includes(tag))
          .slice(0, 3) // Take up to 3 tags
          .join(",");
        
        const fallbackUrl = `https://loremflickr.com/1024/1024/${tags || "business,marketing"}`;
        console.log("Downloading fallback image from LoremFlickr URL:", fallbackUrl);
        generatedImageUrl = await downloadAndSaveFile(fallbackUrl, "jpg");
      }
    }

    // Save image to database MediaAsset
    const asset = await prisma.mediaAsset.create({
      data: {
        workspaceId: workspace.id,
        fileName: generatedImageUrl.split("/").pop() || "ai-image.jpg",
        fileUrl: generatedImageUrl,
        fileType: "IMAGE",
        status: "APPROVED",
      }
    });

    revalidatePath("/dashboard/multi-post");
    return { success: true, asset };
  } catch (error: any) {
    console.error("Generate AI Image Action Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Fetches / generates a video based on keywords
 * and downloads it to local server storage.
 */
export async function generateAIVideoAction(prompt: string, category: string = "trending") {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) return { success: false, error: "Workspace not found" };

    const role = await getUserWorkspaceRole(workspace.id);
    if (role === "VIEWER") {
      return { success: false, error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสร้างวิดีโอได้" };
    }

    if (!prompt.trim()) {
      return { success: false, error: "โปรดระบุรายละเอียดวิดีโอหรือคีย์เวิร์ด" };
    }

    // ── Clean & match keywords ──
    const searchTerms = prompt.toLowerCase();
    
    // Find the best match in our curated videos
    let matchedVideos = CURATED_VIDEOS.filter(video => {
      // Check category
      if (searchTerms.includes(video.category)) return true;
      // Check tags
      return video.tags.some(tag => searchTerms.includes(tag));
    });

    // Fallback to category filter or trending selection
    if (matchedVideos.length === 0) {
      const categoryMatch = CURATED_VIDEOS.filter(v => v.category === category.toLowerCase());
      if (categoryMatch.length > 0) {
        matchedVideos = categoryMatch;
      } else {
        matchedVideos = CURATED_VIDEOS; // All videos fallback
      }
    }

    // Pick a random matching video
    const selectedVideo = matchedVideos[Math.floor(Math.random() * matchedVideos.length)];
    
    // Download the video file to our server uploads directory so Facebook Page API can access it
    const localVideoUrl = await downloadAndSaveFile(selectedVideo.videoUrl, "mp4");

    // Save video to database MediaAsset
    const asset = await prisma.mediaAsset.create({
      data: {
        workspaceId: workspace.id,
        fileName: localVideoUrl.split("/").pop() || "ai-video.mp4",
        fileUrl: localVideoUrl,
        fileType: "VIDEO",
        status: "APPROVED",
      }
    });

    revalidatePath("/dashboard/multi-post");
    return { success: true, asset };
  } catch (error: any) {
    console.error("Generate AI Video Action Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Generates a highly-structured article based on topic, tone, language.
 */
export async function generateAIArticleAction(
  topic: string,
  tone: string = "professional",
  length: string = "medium",
  language: string = "Thai"
) {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) return { success: false, error: "Workspace not found" };

    const role = await getUserWorkspaceRole(workspace.id);
    if (role === "VIEWER") {
      return { success: false, error: "สิทธิ์ไม่เพียงพอ — Viewer ไม่สามารถสร้างบทความได้" };
    }

    if (!topic.trim()) {
      return { success: false, error: "โปรดกรอกหัวข้อหรือคีย์เวิร์ดของบทความ" };
    }

    const promptConfig = await prisma.promptConfig.findFirst({
      where: { workspaceId: workspace.id, isActive: true },
    });

    if (!promptConfig) {
      return { 
        success: false, 
        error: "กรุณาตั้งค่า AI Prompt Config (API Key) ในหน้าตั้งค่าก่อนใช้งานเขียนบทความ" 
      };
    }

    // Set up the article writing prompt
    const systemPrompt = `You are a professional article writer and copywriter.
Generate a structured, highly-engaging long-form article based on the topic.
Format the article clearly with:
1. A catchy headline
2. An engaging introduction paragraph
3. Two or three main body paragraphs, each separated by a subheading
4. A concluding paragraph with a clear Call to Action (CTA)
5. 5-7 targeted hashtags at the bottom

IMPORTANT RULES:
- Write strictly in ${language} language.
- Use paragraph breaks (double newlines) for readability.
- Do NOT wrap the entire response in markdown block tags like \`\`\`markdown.
- Tone of voice: ${tone} (e.g. professional, informative, sales/hard-sell, casual/fun, storytelling).
- Target length: ${length} (e.g. short: ~200 words, medium: ~450 words, long: ~800 words).`;

    const userPrompt = `Topic: "${topic}"\nTone: ${tone}\nLength: ${length}\nLanguage: ${language}\n\nWrite the article now:`;

    let textContent = "";

    if (promptConfig.provider === "GEMINI") {
      const geminiModels = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
      let success = false;
      let lastError = "";

      for (const model of geminiModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${promptConfig.apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }]
              }),
            }
          );
          const data = await response.json();
          if (!response.ok) {
            lastError = data.error?.message || `Model ${model} failed`;
            continue;
          }
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            textContent = text;
            success = true;
            break;
          }
        } catch (e: any) {
          lastError = e.message;
          continue;
        }
      }

      if (!success) {
        throw new Error(`All Gemini models failed. Last error: ${lastError}`);
      }
    } else {
      // Fallback/Default call (OpenRouter / OpenAI)
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${promptConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "API request failed");
      }
      textContent = data.choices[0].message.content;
    }

    return { success: true, article: textContent.trim() };
  } catch (error: any) {
    console.error("Generate AI Article Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Returns a list of curated videos for the UI preview
 */
export async function getCuratedVideosListAction() {
  return { success: true, videos: CURATED_VIDEOS };
}
