import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["reorder-pages"];

import { PdfReorderTool } from "@/features/pdf-reorder/components/pdf-reorder-tool";

export default function ReorderPagesPage() {
  return <PdfReorderTool />;
}
