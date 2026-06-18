import { getToolMetadata } from "@/lib/seo";
import { SecretsTool } from "@/features/uuid/components/secrets-tool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("secrets", locale);
}

export default function SecretsPage() {
  return <SecretsTool />;
}
