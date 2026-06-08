import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["extract-pages"];

import { PdfExtractTool } from "@/features/pdf-extract/components/pdf-extract-tool";

export default function ExtractPagesPage() {
  return <PdfExtractTool />;
}
