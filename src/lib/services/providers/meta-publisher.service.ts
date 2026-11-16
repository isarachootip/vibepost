import {
  filterPublicMediaUrls,
  type PublishableConnection,
  type PublishablePost,
} from "../publisher-types";

const GRAPH_BASE_URL = "https://graph.facebook.com/v19.0";

interface GraphApiResponse {
  id?: string;
  post_id?: string;
  status_code?: string;
  error?: {
    message?: string;
  };
}

async function postGraphJson(
  endpoint: string,
  payload: Record<string, unknown>,
  fallbackError: string
): Promise<GraphApiResponse> {
  const res = await fetch(`${GRAPH_BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as GraphApiResponse;
  if (!res.ok) {
    throw new Error(data.error?.message || fallbackError);
  }
  return data;
}

export async function publishToFacebook(
  post: PublishablePost,
  connection: PublishableConnection
): Promise<string> {
  const pageId = connection.accountId;
  const accessToken = connection.accessToken;
  const message = post.content;

  const validVideos = filterPublicMediaUrls(post.media, "VIDEO");
  const validImages = filterPublicMediaUrls(post.media, "IMAGE");

  if (validVideos.length > 0) {
    const data = await postGraphJson(
      `${pageId}/videos`,
      { description: message, file_url: validVideos[0], access_token: accessToken },
      "Facebook Video API Error"
    );
    if (!data.id) throw new Error("Facebook Video API returned no ID");
    return data.id;
  }

  if (validImages.length === 0) {
    const data = await postGraphJson(
      `${pageId}/feed`,
      { message, access_token: accessToken },
      "Facebook API Error"
    );
    if (!data.id) throw new Error("Facebook Feed API returned no ID");
    return data.id;
  }

  if (validImages.length === 1) {
    const data = await postGraphJson(
      `${pageId}/photos`,
      { message, url: validImages[0], access_token: accessToken },
      "Facebook Photo API Error"
    );
    const extId = data.post_id || data.id;
    if (!extId) throw new Error("Facebook Photo API returned no ID");
    return extId;
  }

  // Multi-photo album post
  const photoIds: string[] = [];
  for (const imgUrl of validImages) {
    const uploadData = await postGraphJson(
      `${pageId}/photos`,
      { url: imgUrl, published: false, access_token: accessToken },
      `Photo upload failed: ${imgUrl}`
    );
    if (!uploadData.id) throw new Error(`Photo upload missing ID: ${imgUrl}`);
    photoIds.push(uploadData.id);
  }

  const feedData = await postGraphJson(
    `${pageId}/feed`,
    {
      message,
      attached_media: photoIds.map((id) => ({ media_fbid: id })),
      access_token: accessToken,
    },
    "Facebook multi-photo post failed"
  );
  if (!feedData.id) throw new Error("Facebook multi-photo API returned no ID");
  return feedData.id;
}

export async function publishToInstagram(
  post: PublishablePost,
  connection: PublishableConnection
): Promise<string> {
  const igAccountId = connection.accountId;
  const accessToken = connection.accessToken;
  const caption = post.content;

  const validVideos = filterPublicMediaUrls(post.media, "VIDEO");
  const validImages = filterPublicMediaUrls(post.media, "IMAGE");

  let containerId: string;

  if (validVideos.length > 0) {
    const initData = await postGraphJson(
      `${igAccountId}/media`,
      {
        media_type: "REELS",
        video_url: validVideos[0],
        caption,
        access_token: accessToken,
      },
      "Instagram Video Container Init Failed"
    );
    if (!initData.id) throw new Error("Instagram Video Container returned no ID");
    containerId = initData.id;

    let finished = false;
    for (let attempt = 0; attempt < 15 && !finished; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const pollRes = await fetch(`${GRAPH_BASE_URL}/${containerId}?fields=status_code`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const pollData = (await pollRes.json()) as GraphApiResponse;
      if (pollData.status_code === "FINISHED") {
        finished = true;
      } else if (pollData.status_code === "ERROR") {
        throw new Error("Instagram Video Container Processing Error");
      }
    }
    if (!finished) {
      throw new Error("Instagram Video Container Processing Timeout");
    }
  } else if (validImages.length > 0) {
    const initData = await postGraphJson(
      `${igAccountId}/media`,
      { image_url: validImages[0], caption, access_token: accessToken },
      "Instagram Image Container Init Failed"
    );
    if (!initData.id) throw new Error("Instagram Image Container returned no ID");
    containerId = initData.id;
  } else {
    throw new Error("Instagram posts require at least one public image or video.");
  }

  const pubData = await postGraphJson(
    `${igAccountId}/media_publish`,
    { creation_id: containerId, access_token: accessToken },
    "Instagram Media Publish Failed"
  );
  if (!pubData.id) throw new Error("Instagram Media Publish returned no ID");
  return pubData.id;
}
