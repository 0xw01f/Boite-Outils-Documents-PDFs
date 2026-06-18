import { getToolMetadata } from "@/lib/seo";
import { JsonFormatterTool } from "@/features/json-formatter/components/json-formatter-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("json-formatter", locale);
}

export default function JsonFormatterPage() {
  return <JsonFormatterTool />;
}
