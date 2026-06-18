import { getToolMetadata } from "@/lib/seo";
import { MetadataTool } from "@/features/remove-metadata/components/metadata-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("metadata-manager", locale);
}

export default function MetadataManagerPage() {
  return <MetadataTool />;
}
