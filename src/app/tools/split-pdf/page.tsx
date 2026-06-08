import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["split-pdf"];

import { SplitPdfTool } from "@/features/split-pdf/components/split-pdf-tool";

export default function SplitPdfPage() {
  return <SplitPdfTool />;
}
