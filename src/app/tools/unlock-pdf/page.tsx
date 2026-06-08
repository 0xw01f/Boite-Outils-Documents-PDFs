import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["unlock-pdf"];

import { PdfUnlockTool } from "@/features/pdf-unlock/components/pdf-unlock-tool";

export default function UnlockPdfPage() {
  return <PdfUnlockTool />;
}
