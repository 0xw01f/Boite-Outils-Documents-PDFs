import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["resize-image"];

import { ImageResizeTool } from "@/features/image-resize/components/image-resize-tool";

export default function ResizeImagePage() {
  return <ImageResizeTool />;
}
