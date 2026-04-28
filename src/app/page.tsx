import { getPublishedPostsForLanding } from "@/lib/actions/posts";
import LandingClient from "./LandingClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "VibePost — ผลงานการโพสต์อัตโนมัติ",
  description:
    "ชมผลงานการโพสต์อัตโนมัติไปยังทุก Social Media Channel ด้วยระบบ VibePost Auto-Post System",
};

export default async function LandingPage() {
  const { posts, totalPosts, totalChannels } = await getPublishedPostsForLanding();

  return (
    <LandingClient 
      dbPosts={posts} 
      initialTotal={totalPosts} 
      initialChannels={totalChannels} 
    />
  );
}
