import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["remove-metadata"];

import { RemoveMetadataTool } from "@/features/remove-metadata/components/remove-metadata-tool";

export default function RemoveMetadataPage() {
  return <RemoveMetadataTool />;
}
