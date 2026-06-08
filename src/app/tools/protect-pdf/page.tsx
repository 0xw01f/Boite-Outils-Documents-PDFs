import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["protect-pdf"];

import { PdfProtectTool } from "@/features/pdf-protect/components/pdf-protect-tool";

export default function ProtectPdfPage() {
  return <PdfProtectTool />;
}
