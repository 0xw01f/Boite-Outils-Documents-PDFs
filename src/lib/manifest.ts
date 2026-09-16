import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";

export async function buildManifest(locale: string): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({ locale, namespace: "manifest" });

  return {
    name: t("name"),
    short_name: t("shortName"),
    description: t("description"),
    start_url: `/${locale}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
