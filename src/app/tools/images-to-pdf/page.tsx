import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["images-to-pdf"];

import { ImagesToPdfTool } from "@/features/images-to-pdf/components/images-to-pdf-tool";

export default function ImagesToPdfPage() {
  return <ImagesToPdfTool />;
}
