import crypto from "crypto";
import path from "path";
import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import type {
  VeoAspectRatio,
  VeoDurationSeconds,
  VeoModelTier,
} from "@/lib/validations/veo-video.schema";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface VeoSourceImagePayload {
  base64Bytes: string;
  mimeType: string;
}

interface GeminiOperationPayload {
  name?: string;
  done?: boolean;
  error?: { message?: string; code?: number; status?: string };
  response?: {
    generateVideoResponse?: {
      generatedSamples?: Array<{ video?: { uri?: string } }>;
      raiMediaFilteredReasons?: string[];
    };
    generatedVideos?: Array<{ video?: { uri?: string } }>;
  };
}

export type VeoOperationCheckResult =
  | { status: "PROCESSING" }
  | { status: "COMPLETED"; videoUri: string }
  | { status: "FAILED"; errorMessage: string };

export function resolveVeoModelId(tier: VeoModelTier): string {
  return tier === "STANDARD" ? "veo-3.1-generate-preview" : "veo-3.1-fast-generate-preview";
}

export function estimateVeoClipCostUsd(tier: VeoModelTier, durationSeconds: VeoDurationSeconds): number {
  const perSecondUsd = tier === "STANDARD" ? 0.4 : 0.15;
  return Number((perSecondUsd * durationSeconds).toFixed(2));
}

export async function loadSourceImageForVeo(
  sourceImageUrl: string,
  uploadDir: string
): Promise<VeoSourceImagePayload> {
  const extToMime = (ext: string): string => {
    const clean = ext.toLowerCase();
    if (clean === "png") return "image/png";
    if (clean === "webp") return "image/webp";
    return "image/jpeg";
  };

  if (sourceImageUrl.includes("/api/files/")) {
    const rawName = sourceImageUrl.split("/api/files/").pop()?.split("?")[0] ?? "";
    const safeName = path.basename(rawName);
    const localPath = path.join(uploadDir, safeName);
    if (safeName && existsSync(localPath)) {
      const buf = await readFile(localPath);
      const ext = safeName.split(".").pop() ?? "jpg";
      return { base64Bytes: buf.toString("base64"), mimeType: extToMime(ext) };
    }
  }

  if (!sourceImageUrl.startsWith("https://")) {
    throw new Error("รูปภาพต้นทางสำหรับ Image-to-Video ต้องเป็นไฟล์ในระบบหรือ HTTPS URL");
  }

  const res = await fetch(sourceImageUrl);
  if (!res.ok) {
    throw new Error(`ไม่สามารถดึงรูปภาพต้นทางได้ (HTTP ${res.status})`);
  }
  const contentType = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  return { base64Bytes: buf.toString("base64"), mimeType: contentType };
}

export async function startVeoLongRunningOperation(params: {
  apiKey: string;
  modelName: string;
  englishPrompt: string;
  aspectRatio: VeoAspectRatio;
  durationSeconds: VeoDurationSeconds;
  sourceImage?: VeoSourceImagePayload;
  fetchFn?: typeof fetch;
}): Promise<{ operationName: string }> {
  const fetchImpl = params.fetchFn ?? fetch;
  const instance: Record<string, unknown> = { prompt: params.englishPrompt };
  if (params.sourceImage) {
    instance.image = {
      bytesBase64Encoded: params.sourceImage.base64Bytes,
      mimeType: params.sourceImage.mimeType,
    };
  }

  const res = await fetchImpl(
    `${GEMINI_API_BASE}/models/${params.modelName}:predictLongRunning`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": params.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [instance],
        parameters: {
          aspectRatio: params.aspectRatio,
          durationSeconds: params.durationSeconds,
        },
      }),
    }
  );

  const data = (await res.json().catch(() => ({}))) as GeminiOperationPayload;
  if (!res.ok || !data.name) {
    throw new Error(data.error?.message || `Google Veo API ปฏิเสธคำขอ (HTTP ${res.status})`);
  }

  return { operationName: data.name };
}

export async function checkVeoOperationState(params: {
  apiKey: string;
  operationName: string;
  fetchFn?: typeof fetch;
}): Promise<VeoOperationCheckResult> {
  const fetchImpl = params.fetchFn ?? fetch;
  const cleanOp = params.operationName.replace(/^\/+/, "");
  const res = await fetchImpl(`${GEMINI_API_BASE}/${cleanOp}`, {
    method: "GET",
    headers: { "x-goog-api-key": params.apiKey },
  });

  const data = (await res.json().catch(() => ({}))) as GeminiOperationPayload;
  if (!res.ok) {
    return {
      status: "FAILED",
      errorMessage: data.error?.message || `ตรวจสอบสถานะ Veo ไม่สำเร็จ (HTTP ${res.status})`,
    };
  }

  if (!data.done) {
    return { status: "PROCESSING" };
  }

  if (data.error) {
    return {
      status: "FAILED",
      errorMessage: data.error.message || "Google Veo ประมวลผลล้มเหลว",
    };
  }

  const filtered = data.response?.generateVideoResponse?.raiMediaFilteredReasons;
  if (filtered && filtered.length > 0) {
    return {
      status: "FAILED",
      errorMessage: `ติดตัวกรองความปลอดภัยของ Google (Safety Filter): ${filtered.join(", ")}`,
    };
  }

  const uri =
    data.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ??
    data.response?.generatedVideos?.[0]?.video?.uri;

  if (!uri) {
    return { status: "FAILED", errorMessage: "ไม่พบไฟล์วิดีโอในผลลัพธ์จาก Google Veo" };
  }

  return { status: "COMPLETED", videoUri: uri };
}

export async function downloadVeoVideoToUploads(params: {
  videoUri: string;
  apiKey: string;
  uploadDir: string;
  publicBaseUrl: string;
}): Promise<{ fileName: string; publicUrl: string }> {
  const res = await fetch(params.videoUri, {
    headers: { "x-goog-api-key": params.apiKey },
  });
  if (!res.ok) {
    throw new Error(`ดาวน์โหลดไฟล์วิดีโอจาก Google Veo ไม่สำเร็จ (HTTP ${res.status})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (!existsSync(params.uploadDir)) {
    await mkdir(params.uploadDir, { recursive: true });
  }
  const fileName = `veo-${Date.now()}-${crypto.randomBytes(8).toString("hex")}.mp4`;
  await writeFile(path.join(params.uploadDir, fileName), buffer);
  return {
    fileName,
    publicUrl: `${params.publicBaseUrl.replace(/\/+$/, "")}/api/files/${fileName}`,
  };
}
