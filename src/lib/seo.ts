import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function getToolMetadata(toolId: string, locale: string): Promise<Metadata> {
  const m = await getTranslations({ locale, namespace: "metadata" });
  const t = await getTranslations({ locale, namespace: "seo.tools" });
  const common = await getTranslations({ locale, namespace: "seo.common" });

  return {
    metadataBase: new URL("https://argus-labs.fr"),
    title: t(`${toolId}.title`),
    description: t(`${toolId}.description`),
    keywords: [...t.raw(`${toolId}.keywords`), ...common.raw("keywords")],
    authors: [{ name: m("author") }],
    creator: m("author"),
    openGraph: {
      type: "website",
      locale: m("locale"),
      siteName: m("siteName"),
    },
    robots: { index: true, follow: true },
  };
}
