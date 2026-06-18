import { getToolMetadata } from "@/lib/seo";
import { PdfDeleteTool } from "@/features/pdf-delete/components/pdf-delete-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("delete-pages", locale);
}

export default function DeletePagesPage() {
  return <PdfDeleteTool />;
}
