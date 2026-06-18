import { getToolMetadata } from "@/lib/seo";
import { ImagesToPdfTool } from "@/features/images-to-pdf/components/images-to-pdf-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("images-to-pdf", locale);
}

export default function ImagesToPdfPage() {
  return <ImagesToPdfTool />;
}
