import { getToolMetadata } from "@/lib/seo";
import { HashTool } from "@/features/hash/components/hash-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("hash", locale);
}

export default function HashPage() {
  return <HashTool />;
}
