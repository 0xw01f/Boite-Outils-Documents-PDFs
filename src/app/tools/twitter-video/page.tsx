import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["twitter-video"];

import { TwitterVideoTool } from "@/features/twitter-video/components/twitter-video-tool";

export default function TwitterVideoPage() {
  return <TwitterVideoTool />;
}
