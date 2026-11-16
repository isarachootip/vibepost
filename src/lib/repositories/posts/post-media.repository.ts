import { prisma } from "@/lib/prisma";

const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "quicktime"];

export async function attachMediaUrlsToPost(
  workspaceId: string,
  postId: string,
  urls: string[],
  assetStatus: "PENDING" | "APPROVED"
): Promise<void> {
  for (const url of urls) {
    const ext = url.split(".").pop()?.toLowerCase() || "";
    const isVideo = VIDEO_EXTENSIONS.includes(ext);

    const asset = await prisma.mediaAsset.create({
      data: {
        workspaceId,
        fileName: url.split("/").pop() || (isVideo ? "video.mp4" : "image.jpg"),
        fileUrl: url,
        fileType: isVideo ? "VIDEO" : "IMAGE",
        status: assetStatus,
      },
    });
    await prisma.postMedia.create({
      data: { postId, mediaAssetId: asset.id },
    });
  }
}
