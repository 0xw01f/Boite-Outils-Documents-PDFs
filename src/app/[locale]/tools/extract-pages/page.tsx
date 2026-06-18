import { getToolMetadata } from "@/lib/seo";
import { PdfExtractTool } from "@/features/pdf-extract/components/pdf-extract-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("extract-pages", locale);
}

export default function ExtractPagesPage() {
  return <PdfExtractTool />;
}
