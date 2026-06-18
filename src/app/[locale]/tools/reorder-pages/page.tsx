import { getToolMetadata } from "@/lib/seo";
import { PdfReorderTool } from "@/features/pdf-reorder/components/pdf-reorder-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("reorder-pages", locale);
}

export default function ReorderPagesPage() {
  return <PdfReorderTool />;
}
