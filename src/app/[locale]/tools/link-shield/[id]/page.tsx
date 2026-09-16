import { getLinkShieldGateMetadata } from "@/lib/seo";
import { LinkShieldGate } from "@/features/link-shield/components/link-shield-gate";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getLinkShieldGateMetadata(locale);
}

export default async function LinkShieldGatePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  return <LinkShieldGate id={id} />;
}
