import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["delete-pages"];

import { PdfDeleteTool } from "@/features/pdf-delete/components/pdf-delete-tool";

export default function DeletePagesPage() {
  return <PdfDeleteTool />;
}
