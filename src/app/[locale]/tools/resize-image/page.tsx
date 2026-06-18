import { getToolMetadata } from "@/lib/seo";
import { ImageResizeTool } from "@/features/image-resize/components/image-resize-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("resize-image", locale);
}

export default function ResizeImagePage() {
  return <ImageResizeTool />;
}
