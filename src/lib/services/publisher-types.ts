export type SupportedMediaType = "IMAGE" | "VIDEO";

export interface PublishableMediaEntry {
  mediaAsset: {
    fileType: SupportedMediaType | string;
    fileUrl: string;
  };
}

export interface PublishableConnection {
  id: string;
  platform: string;
  accountId: string;
  accountName: string;
  accessToken: string;
  isActive: boolean;
}

export interface PublishableTarget {
  id: string;
  status: string;
  socialConnection: PublishableConnection;
}

export interface PublishablePost {
  id: string;
  content: string;
  media: PublishableMediaEntry[];
  targets: PublishableTarget[];
}

export interface ExecuteAutoPostOptions {
  postId?: string;
}

export interface ExecuteAutoPostResult {
  success: boolean;
  count?: number;
  error?: string;
}

export function isPublicMediaUrl(url: string | null | undefined): url is string {
  if (!url || url.length <= 10) return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  if (url.includes("localhost") || url.includes("127.0.0.1") || url.startsWith("blob:")) {
    return false;
  }
  return true;
}

export function filterPublicMediaUrls(
  media: PublishableMediaEntry[],
  fileType: SupportedMediaType
): string[] {
  return media
    .filter((m) => m.mediaAsset.fileType === fileType)
    .map((m) => m.mediaAsset.fileUrl)
    .filter(isPublicMediaUrl);
}
