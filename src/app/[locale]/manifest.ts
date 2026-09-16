import { buildManifest } from "@/lib/manifest";

export default async function manifest({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildManifest(locale);
}
