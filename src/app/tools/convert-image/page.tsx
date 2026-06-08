import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["convert-image"];

import { ImageConvertTool } from "@/features/image-convert/components/image-convert-tool";

export default function ConvertImagePage() {
  return <ImageConvertTool />;
}
