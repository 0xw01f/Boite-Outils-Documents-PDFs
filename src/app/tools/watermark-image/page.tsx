import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["watermark-image"];

import { WatermarkImageTool } from "@/features/watermark/components/watermark-image-tool";

export default function WatermarkImagePage() {
  return <WatermarkImageTool />;
}
