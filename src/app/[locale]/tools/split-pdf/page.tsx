import { getToolMetadata } from "@/lib/seo";
import { SplitPdfTool } from "@/features/split-pdf/components/split-pdf-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("split-pdf", locale);
}

export default function SplitPdfPage() {
  return <SplitPdfTool />;
}
