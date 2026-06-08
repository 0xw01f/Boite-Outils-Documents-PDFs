import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["compress-image"];

import { ImageCompressTool } from "@/features/image-compress/components/image-compress-tool";

export default function CompressImagePage() {
  return <ImageCompressTool />;
}
