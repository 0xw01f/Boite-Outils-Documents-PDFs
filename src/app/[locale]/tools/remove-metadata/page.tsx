import { getToolMetadata } from "@/lib/seo";
import { RemoveMetadataTool } from "@/features/remove-metadata/components/remove-metadata-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("remove-metadata", locale);
}

export default function RemoveMetadataPage() {
  return <RemoveMetadataTool />;
}
