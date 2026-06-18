import { getToolMetadata } from "@/lib/seo";
import { PdfRotateTool } from "@/features/pdf-rotate/components/pdf-rotate-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("rotate-pdf", locale);
}

export default function RotatePdfPage() {
  return <PdfRotateTool />;
}
