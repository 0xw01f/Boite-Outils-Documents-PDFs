import { getToolMetadata } from "@/lib/seo";
import { PdfCompressTool } from "@/features/pdf-compress/components/pdf-compress-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("compress-pdf", locale);
}

export default function CompressPdfPage() {
  return <PdfCompressTool />;
}
