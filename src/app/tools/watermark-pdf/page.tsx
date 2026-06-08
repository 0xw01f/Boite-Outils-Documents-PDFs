import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["watermark-pdf"];

import { WatermarkPdfTool } from "@/features/watermark/components/watermark-pdf-tool";

export default function WatermarkPdfPage() {
  return <WatermarkPdfTool />;
}
