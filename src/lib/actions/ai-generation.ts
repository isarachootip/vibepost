"use server";

import { prisma } from "@/lib/prisma";
import { getActiveWorkspaceContext } from "./workspace";
import { getUserWorkspaceRole } from "./posts";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vibepost.online";

/**
 * Helper to record AI usage log.
 */
async function recordAIUsage(
  workspaceId: string,
  actionType: "ARTICLE" | "IMAGE" | "VIDEO",
  provider: string,
  modelName: string | null,
  promptTokens: number,
  completionTokens: number,
  totalTokens: number,
  estimatedCost: number
) {
  try {
    await prisma.aIUsageLog.create({
      data: {
        workspaceId,
        actionType,
        provider,
        modelName,
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost
      }
    });
  } catch (err) {
    console.error("Failed to record AI usage log:", err);
  }
}

/**
 * Helper to calculate article cost based on model name and tokens.
 */
function calculateArticleCost(modelName: string, promptTokens: number, completionTokens: number): number {
  let cost = 0;
  const model = modelName.toLowerCase();
  
  if (model.includes("gemini-2.5-pro")) {
    // Input: $1.25 / 1M, Output: $5.00 / 1M
    cost = (promptTokens * 1.25 + completionTokens * 5.00) / 1000000;
  } else if (model.includes("gemini-2.5-flash") || model.includes("gemini-2.0-flash") || model.includes("gemini-3") || model.includes("gemini-2")) {
    // Input: $0.075 / 1M, Output: $0.30 / 1M
    cost = (promptTokens * 0.075 + completionTokens * 0.30) / 1000000;
  } else if (model.includes("gpt-3.5") || model.includes("openai")) {
    // Input: $0.50 / 1M, Output: $1.50 / 1M
    cost = (promptTokens * 0.50 + completionTokens * 1.50) / 1000000;
  } else {
    // Default low rate
    cost = (promptTokens * 0.10 + completionTokens * 0.40) / 1000000;
  }
  
  return cost;
}


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

          // Log Gemini Imagen Usage ($0.03 estimated cost)
          await recordAIUsage(workspace.id, "IMAGE", "GEMINI", "imagen-4.0-fast-generate-001", 0, 0, 0, 0.03);
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

          // Log OpenAI DALL-E 3 Usage ($0.04 estimated cost)
          await recordAIUsage(workspace.id, "IMAGE", "OPENAI", "dall-e-3", 0, 0, 0, 0.04);
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

        // Log Pollinations Usage ($0.00 cost)
        await recordAIUsage(workspace.id, "IMAGE", "FREE", "pollinations.ai", 0, 0, 0, 0.00);
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

        // Log LoremFlickr Usage ($0.00 cost)
        await recordAIUsage(workspace.id, "IMAGE", "FREE", "loremflickr", 0, 0, 0, 0.00);
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
 * Helper to generate a JWT for Kling AI API using native crypto module.
 */
function generateKlingJWT(ak: string, sk: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    iss: ak,
    exp: Math.floor(Date.now() / 1000) + 1800, // Token expires in 30 minutes
    nbf: Math.floor(Date.now() / 1000) - 5
  };
  
  const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };
  
  const tokenHeader = base64UrlEncode(JSON.stringify(header));
  const tokenPayload = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${tokenHeader}.${tokenPayload}`;
  
  const signature = crypto
    .createHmac("sha256", sk)
    .update(signatureInput)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
    
  return `${signatureInput}.${signature}`;
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

    // ── Check if there is an active KLING or LUMA API config ──
    const activeLumaConfig = await prisma.promptConfig.findFirst({
      where: { workspaceId: workspace.id, provider: "LUMA", isActive: true },
    });
    const activeKlingConfig = await prisma.promptConfig.findFirst({
      where: { workspaceId: workspace.id, provider: "KLING", isActive: true },
    });

    let generatedVideoUrl = "";
    let finalProvider = "FREE";
    let finalModel = "pexels-stock-video";
    let estimatedCost = 0.0;

    // 1. Try Luma Dream Machine if active
    if (activeLumaConfig && activeLumaConfig.apiKey) {
      try {
        console.log("Creating Luma Dream Machine video task...");
        const response = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${activeLumaConfig.apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: prompt,
            aspect_ratio: "1:1"
          })
        });

        const data = await response.json();
        if (!response.ok || !data.id) {
          throw new Error(data.error || "Luma API creation request failed");
        }

        const taskId = data.id;
        console.log(`Luma Task created: ${taskId}. Starting status polling...`);

        // Poll Luma status
        let completed = false;
        let attempts = 0;
        while (!completed && attempts < 24) {
          // Wait 5 seconds
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;

          const statusRes = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${taskId}`, {
            headers: { "Authorization": `Bearer ${activeLumaConfig.apiKey}` }
          });
          const statusData = await statusRes.json();
          if (!statusRes.ok) continue;

          console.log(`Luma task state (Attempt ${attempts}): ${statusData.state}`);

          if (statusData.state === "completed" && statusData.assets?.video) {
            generatedVideoUrl = statusData.assets.video;
            completed = true;
          } else if (statusData.state === "failed") {
            throw new Error(`Luma generation failed: ${statusData.failure_reason || "unknown error"}`);
          }
        }

        if (!generatedVideoUrl) {
          throw new Error("Luma video generation timed out");
        }

        finalProvider = "LUMA";
        finalModel = "dream-machine-v1";
        estimatedCost = 0.15; // Estimated cost in USD
      } catch (err: any) {
        console.error("Luma Video Generation failed, falling back to stock:", err.message);
      }
    }

    // 2. Try Kling AI if active (and Luma was not used or failed)
    if (!generatedVideoUrl && activeKlingConfig && activeKlingConfig.apiKey) {
      try {
        console.log("Creating Kling AI video task...");
        const [ak, sk] = activeKlingConfig.apiKey.split(":");
        if (!ak || !sk) {
          throw new Error("Invalid Kling API key format. Expected AccessKey:SecretKey");
        }

        const token = generateKlingJWT(ak, sk);
        const response = await fetch("https://api-singapore.klingai.com/v1/videos/text2video", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model_name: "kling-v2-6",
            prompt: prompt,
            duration: "5"
          })
        });

        const data = await response.json();
        if (!response.ok || !data.data?.task_id) {
          throw new Error(data.message || "Kling API creation request failed");
        }

        const taskId = data.data.task_id;
        console.log(`Kling Task created: ${taskId}. Starting status polling...`);

        // Poll Kling status
        let completed = false;
        let attempts = 0;
        while (!completed && attempts < 24) {
          // Wait 5 seconds
          await new Promise(resolve => setTimeout(resolve, 5000));
          attempts++;

          const statusRes = await fetch(`https://api-singapore.klingai.com/v1/videos/text2video/${taskId}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const statusData = await statusRes.json();
          if (!statusRes.ok) continue;

          const task = statusData.data;
          console.log(`Kling task status (Attempt ${attempts}): ${task?.task_status}`);

          if (task?.task_status === "succeed") {
            generatedVideoUrl = task.video_result?.videos?.[0]?.url || "";
            completed = true;
          } else if (task?.task_status === "failed") {
            throw new Error(`Kling generation failed: ${task.task_status_msg || "unknown error"}`);
          }
        }

        if (!generatedVideoUrl) {
          throw new Error("Kling video generation timed out");
        }

        finalProvider = "KLING";
        finalModel = "kling-v2-6";
        estimatedCost = 0.12; // Estimated cost in USD
      } catch (err: any) {
        console.error("Kling Video Generation failed, falling back to stock:", err.message);
      }
    }

    // 3. Fallback to Curated stock videos from Pexels if no AI succeeded
    if (!generatedVideoUrl) {
      console.log("No AI Video configuration active or generation failed. Falling back to Stock Video.");
      const searchTerms = prompt.toLowerCase();
      
      let matchedVideos = CURATED_VIDEOS.filter(video => {
        if (searchTerms.includes(video.category)) return true;
        return video.tags.some(tag => searchTerms.includes(tag));
      });

      if (matchedVideos.length === 0) {
        const categoryMatch = CURATED_VIDEOS.filter(v => v.category === category.toLowerCase());
        if (categoryMatch.length > 0) {
          matchedVideos = categoryMatch;
        } else {
          matchedVideos = CURATED_VIDEOS;
        }
      }

      const selectedVideo = matchedVideos[Math.floor(Math.random() * matchedVideos.length)];
      generatedVideoUrl = selectedVideo.videoUrl;
      finalProvider = "FREE";
      finalModel = "pexels-stock-video";
      estimatedCost = 0.0;
    }

    // Download the video file to local upload directory
    const localVideoUrl = await downloadAndSaveFile(generatedVideoUrl, "mp4");

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

    // Log video usage in billing logs
    await recordAIUsage(workspace.id, "VIDEO", finalProvider, finalModel, 0, 0, 0, estimatedCost);

    revalidatePath("/dashboard/multi-post");
    return { success: true, asset };
  } catch (error: any) {
    console.error("Generate AI Video Action Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Generates 3 highly-structured content formats based on topic, tone, language.
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
    const systemPrompt = `You are an expert copywriter. Generate 3 distinct formats of content based on the topic.
Write strictly in ${language} language.
Use tone of voice: ${tone}.
Target length/depth for the content: ${length}.

Format 1: Long-form Article (บทความยาวเป็นทางการ)
Format 2: Social Media Caption (แคปชันโซเชียลสั้น มี Emojis & เว้นวรรคน่าอ่าน)
Format 3: Marketing Copy / AIDA Structure (เนื้อหาเชิงโฆษณาตามหลัก AIDA: Attention, Interest, Desire, Action)

You MUST separate the 3 formats using exactly these delimiters:
=== FORMAT 1: LONG_FORM ===
[insert Content for Format 1 here]

=== FORMAT 2: SOCIAL_POST ===
[insert Content for Format 2 here]

=== FORMAT 3: MARKETING_AIDA ===
[insert Content for Format 3 here]

Do NOT wrap the entire response in markdown block tags like \`\`\``;

    const userPrompt = `Topic: "${topic}"\nTone: ${tone}\nLength: ${length}\nLanguage: ${language}\n\nWrite the 3 formats now:`;

    let textContent = "";

    if (promptConfig.provider === "KIMI") {
      try {
        const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${promptConfig.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "moonshot-v1-8k",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ]
          })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "Kimi API request failed");
        }
        textContent = data.choices[0].message.content;

        // Record token usage & cost
        const usage = data.usage;
        const promptTokens = usage?.prompt_tokens || 0;
        const completionTokens = usage?.completion_tokens || 0;
        const totalTokens = usage?.total_tokens || 0;
        const cost = (promptTokens * 1.65 + completionTokens * 1.65) / 1000000;
        
        await recordAIUsage(workspace.id, "ARTICLE", "KIMI", "moonshot-v1-8k", promptTokens, completionTokens, totalTokens, cost);
      } catch (e: any) {
        console.error("Kimi API failed:", e.message);
        throw e;
      }
    } else if (promptConfig.provider === "GEMINI") {
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
            
            // Record token usage & cost
            const usage = data.usageMetadata;
            const promptTokens = usage?.promptTokenCount || 0;
            const completionTokens = usage?.candidatesTokenCount || 0;
            const totalTokens = usage?.totalTokenCount || 0;
            const cost = calculateArticleCost(model, promptTokens, completionTokens);
            
            await recordAIUsage(workspace.id, "ARTICLE", "GEMINI", model, promptTokens, completionTokens, totalTokens, cost);
            
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

      // Record token usage & cost
      const usage = data.usage;
      const promptTokens = usage?.prompt_tokens || 0;
      const completionTokens = usage?.completion_tokens || 0;
      const totalTokens = usage?.total_tokens || 0;
      const cost = calculateArticleCost("openai/gpt-3.5-turbo", promptTokens, completionTokens);
      
      await recordAIUsage(workspace.id, "ARTICLE", "OPENAI", "openai/gpt-3.5-turbo", promptTokens, completionTokens, totalTokens, cost);
    }

    // Parsing helper
    let longFormText = "";
    let socialPostText = "";
    let marketingAidaText = "";

    const cleanText = textContent.trim();
    if (cleanText.includes("=== FORMAT 1: LONG_FORM ===")) {
      const parts = cleanText.split(/=== FORMAT \d: [A-Z_]+ ===/);
      longFormText = parts[1]?.trim() || "";
      socialPostText = parts[2]?.trim() || "";
      marketingAidaText = parts[3]?.trim() || "";
    }

    // Fallback if delimiters were missing
    if (!longFormText) {
      longFormText = cleanText;
      socialPostText = cleanText.substring(0, Math.min(300, cleanText.length)) + "...";
      marketingAidaText = `Attention: ${topic}\nInterest: Interested in ${topic}?\nDesire: Want to know more about ${topic}?\nAction: Contact us!`;
    }

    return { 
      success: true, 
      article: longFormText, 
      formats: { 
        longForm: longFormText, 
        socialPost: socialPostText, 
        marketingAida: marketingAidaText 
      } 
    };
  } catch (error: any) {
    console.error("Generate AI Article Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action: Fetches AI Usage statistics for the active workspace.
 */
export async function getAIUsageStatsAction() {
  try {
    const workspace = await getActiveWorkspaceContext();
    if (!workspace) return { success: false, error: "Workspace not found" };

    const logs = await prisma.aIUsageLog.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" }
    });

    const totalCost = logs.reduce((sum, log) => sum + log.estimatedCost, 0);
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);

    const articleLogs = logs.filter(l => l.actionType === "ARTICLE");
    const imageLogs = logs.filter(l => l.actionType === "IMAGE");
    const videoLogs = logs.filter(l => l.actionType === "VIDEO");

    return {
      success: true,
      stats: {
        totalCost,
        totalTokens,
        totalCalls: logs.length,
        articleCalls: articleLogs.length,
        imageCalls: imageLogs.length,
        videoCalls: videoLogs.length,
        logs: logs.slice(0, 15) // Return latest 15 logs
      }
    };
  } catch (error: any) {
    console.error("Get AI Usage Stats Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Returns a list of curated videos for the UI preview
 */
export async function getCuratedVideosListAction() {
  return { success: true, videos: CURATED_VIDEOS };
}
