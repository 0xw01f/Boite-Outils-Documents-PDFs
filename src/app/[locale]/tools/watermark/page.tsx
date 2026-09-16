import { getToolMetadata } from "@/lib/seo";
import { WatermarkTool } from "@/features/watermark/components/watermark-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("watermark", locale);
}

export default function WatermarkPage() {
  return <WatermarkTool />;
}
