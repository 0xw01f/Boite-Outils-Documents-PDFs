import { getToolMetadata } from "@/lib/seo";
import { TwitterVideoTool } from "@/features/twitter-video/components/twitter-video-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("twitter-video", locale);
}

export default function TwitterVideoPage() {
  return <TwitterVideoTool />;
}
