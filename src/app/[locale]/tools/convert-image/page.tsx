import { getToolMetadata } from "@/lib/seo";
import { ImageConvertTool } from "@/features/image-convert/components/image-convert-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("convert-image", locale);
}

export default function ConvertImagePage() {
  return <ImageConvertTool />;
}
