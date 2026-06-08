import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["rotate-pdf"];

import { PdfRotateTool } from "@/features/pdf-rotate/components/pdf-rotate-tool";

export default function RotatePdfPage() {
  return <PdfRotateTool />;
}
