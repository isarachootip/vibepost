import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedTime: "desc" },
      take: 60,
      include: {
        media: {
          include: {
            mediaAsset: {
              select: { fileUrl: true, fileType: true, fileName: true },
            },
          },
        },
        targets: {
          include: {
            socialConnection: {
              select: { platform: true, accountName: true },
            },
          },
        },
        workspace: {
          select: { name: true },
        },
      },
    });

    const data = posts.map((post) => ({
      id: post.id,
      content: post.content,
      publishedTime: post.publishedTime,
      workspace: post.workspace.name,
      images: post.media
        .filter((m) => m.mediaAsset.fileType === "IMAGE")
        .map((m) => ({
          url: m.mediaAsset.fileUrl,
          fileName: m.mediaAsset.fileName,
        })),
      channels: post.targets.map((t) => ({
        platform: t.socialConnection.platform,
        accountName: t.socialConnection.accountName,
        status: t.status,
      })),
    }));

    return NextResponse.json({ posts: data, total: data.length });
  } catch (error) {
    console.error("[public/published-posts] error:", error);
    return NextResponse.json(
      { posts: [], total: 0, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
