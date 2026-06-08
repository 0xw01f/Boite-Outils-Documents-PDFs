import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["metadata-manager"];

import { MetadataTool } from "@/features/remove-metadata/components/metadata-tool";

export default function MetadataManagerPage() {
  return <MetadataTool />;
}
