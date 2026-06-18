import { getToolMetadata } from "@/lib/seo";
import { ImageCompressTool } from "@/features/image-compress/components/image-compress-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("compress-image", locale);
}

export default function CompressImagePage() {
  return <ImageCompressTool />;
}
