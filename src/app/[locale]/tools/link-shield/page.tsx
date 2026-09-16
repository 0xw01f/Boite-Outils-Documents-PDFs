import { getToolMetadata } from "@/lib/seo";
import { LinkShieldTool } from "@/features/link-shield/components/link-shield-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("link-shield", locale);
}

export default function LinkShieldPage() {
  return <LinkShieldTool />;
}
