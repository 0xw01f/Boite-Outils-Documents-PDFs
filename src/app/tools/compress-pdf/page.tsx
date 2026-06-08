import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["compress-pdf"];

import { PdfCompressTool } from "@/features/pdf-compress/components/pdf-compress-tool";

export default function CompressPdfPage() {
  return <PdfCompressTool />;
}
