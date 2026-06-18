import { getToolMetadata } from "@/lib/seo";
import { MergePdfTool } from "@/features/merge-pdf/components/merge-pdf-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("merge-pdf", locale);
}

export default function MergePdfPage() {
  return <MergePdfTool />;
}
