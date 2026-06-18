import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";

export default async function manifest({ params }: { params: Promise<{ locale: string }> }): Promise<MetadataRoute.Manifest> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "manifest" });

  return {
    name: t("name"),
    short_name: t("shortName"),
    description: t("description"),
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
