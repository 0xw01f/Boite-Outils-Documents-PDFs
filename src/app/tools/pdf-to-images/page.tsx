"use client";

import dynamic from "next/dynamic";

const PdfToImagesTool = dynamic(
  () => import("@/features/pdf-to-images/components/pdf-to-images-tool").then((mod) => mod.PdfToImagesTool),
  { ssr: false }
);

export default function PdfToImagesPage() {
  return <PdfToImagesTool />;
}
