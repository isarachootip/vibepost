import { getPublishedPostsForLanding } from "@/lib/actions/posts";
import { getIsSuperAdminSession } from "@/lib/actions/showcase.actions";
import LandingClient from "./LandingClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VibePost — ผลงานการโพสต์อัตโนมัติ",
  description:
    "ชมผลงานการโพสต์อัตโนมัติไปยังทุก Social Media Channel ด้วยระบบ VibePost Auto-Post System",
};

export default async function LandingPage() {
  const isSuperAdmin = await getIsSuperAdminSession();
  const showcase = await getPublishedPostsForLanding({
    includeHidden: isSuperAdmin,
  });

  return (
    <LandingClient
      dbPosts={showcase.posts}
      initialTotal={showcase.totalPosts}
      initialChannels={showcase.totalChannels}
      initialSuccessCount={showcase.totalSuccessfulReposts}
      initialPlatforms={showcase.uniquePlatforms}
      hiddenCount={showcase.hiddenCount}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
