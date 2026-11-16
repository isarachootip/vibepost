import {
  filterPublicMediaUrls,
  type PublishableConnection,
  type PublishablePost,
} from "../publisher-types";

interface TikTokInitResponse {
  data?: {
    publish_id?: string;
  };
  error?: {
    code?: string;
    message?: string;
  };
}

interface YouTubeApiResponse {
  id?: string;
  error?: {
    message?: string;
  };
}

export async function publishToTikTok(
  post: PublishablePost,
  connection: PublishableConnection
): Promise<string> {
  const accessToken = connection.accessToken;
  const title = post.content;

  const validVideos = filterPublicMediaUrls(post.media, "VIDEO");
  const validImages = filterPublicMediaUrls(post.media, "IMAGE");

  if (validVideos.length > 0) {
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_info: { title, privacy_level: "PUBLIC_TO_EVERYONE" },
        source_info: { source: "PULL_FROM_URL", video_url: validVideos[0] },
      }),
    });
    const data = (await res.json()) as TikTokInitResponse;
    if (data.error?.code !== "ok" || !data.data?.publish_id) {
      throw new Error(data.error?.message || "TikTok Video Init Failed");
    }
    return data.data.publish_id;
  }

  if (validImages.length > 0) {
    const res = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_info: { title, privacy_level: "PUBLIC_TO_EVERYONE" },
        source_info: {
          source: "PULL_FROM_URL",
          photo_cover_index: 0,
          photo_images: validImages,
        },
        post_mode: "MEDIA_POST",
      }),
    });
    const data = (await res.json()) as TikTokInitResponse;
    if (data.error?.code !== "ok" || !data.data?.publish_id) {
      throw new Error(data.error?.message || "TikTok Content Init Failed");
    }
    return data.data.publish_id;
  }

  throw new Error("TikTok posts require at least one public image or video.");
}

export async function publishToYouTube(
  post: PublishablePost,
  connection: PublishableConnection
): Promise<string> {
  const accessToken = connection.accessToken;
  const message = post.content;
  const validVideos = filterPublicMediaUrls(post.media, "VIDEO");

  if (validVideos.length === 0) {
    throw new Error("YouTube posts require at least one public video.");
  }

  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/*",
      },
      body: JSON.stringify({
        snippet: {
          title: message.substring(0, 100) || "Auto Uploaded Video",
          description: message,
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
        },
      }),
    }
  );

  if (!initRes.ok) {
    const initErr = (await initRes.json()) as YouTubeApiResponse;
    throw new Error(initErr.error?.message || "YouTube Resumable Init Failed");
  }

  const uploadUrl = initRes.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("YouTube upload URL location header missing");
  }

  const videoFetch = await fetch(validVideos[0]);
  if (!videoFetch.ok) {
    throw new Error("Failed to download video asset for YouTube upload");
  }
  const videoBuffer = await videoFetch.arrayBuffer();

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": videoBuffer.byteLength.toString(),
      "Content-Type": "video/*",
    },
    body: Buffer.from(videoBuffer),
  });

  const uploadData = (await uploadRes.json()) as YouTubeApiResponse;
  if (!uploadRes.ok || !uploadData.id) {
    throw new Error(uploadData.error?.message || "YouTube Video Upload PUT Failed");
  }

  return uploadData.id;
}
