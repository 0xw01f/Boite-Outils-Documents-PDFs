import { getToolMetadata } from "@/lib/seo";
import { PdfToImagesClient } from "./pdf-to-images-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return getToolMetadata("pdf-to-images", locale);
}

export default function PdfToImagesPage() {
  return <PdfToImagesClient />;
}
