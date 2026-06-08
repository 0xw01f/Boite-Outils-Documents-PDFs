import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["merge-pdf"];

import { MergePdfTool } from "@/features/merge-pdf/components/merge-pdf-tool";

export default function MergePdfPage() {
  return <MergePdfTool />;
}
