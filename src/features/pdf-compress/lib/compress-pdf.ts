"use client";

import { PDFDocument } from "pdf-lib";
import type * as PdfjsType from "pdfjs-dist";

export type CompressMode = "structure" | "strong";

export interface CompressOptions {
  mode: CompressMode;
  quality: number;
  dpi?: number;
  t?: (key: string, values?: Record<string, string | number>) => string;
}

const DEFAULT_DPI = 150;
const MAX_PAGES = 200;

async function loadPdfJs(t?: CompressOptions["t"]): Promise<typeof PdfjsType> {
  if (typeof window === "undefined") {
    throw new Error(t ? t("pdfJsBrowserError") : "pdfjs-dist can only be loaded in the browser");
  }
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjsLib;
}

export async function compressPdf(file: File, options: CompressOptions): Promise<Blob> {
  if (options.mode === "strong") {
    return compressPdfStrong(file, options.quality, options.dpi ?? DEFAULT_DPI, options.t);
  }
  return compressPdfStructure(file);
}

async function compressPdfStructure(file: File): Promise<Blob> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { updateMetadata: false });

  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  pdf.setCreator("");
  pdf.setProducer("");

  const newBytes = await pdf.save({ useObjectStreams: true });
  return new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

async function compressPdfStrong(
  file: File,
  quality: number,
  dpi: number,
  t?: CompressOptions["t"]
): Promise<Blob> {
  const originalSize = file.size;
  const pdfjsLib = await loadPdfJs(t);
  const bytes = await file.arrayBuffer();
  const sourcePdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  if (sourcePdf.numPages > MAX_PAGES) {
    throw new Error(t ? t("tooManyPagesError", { max: MAX_PAGES }) : `PDF too large (max ${MAX_PAGES} pages)`);
  }

  const outputPdf = await PDFDocument.create();
  outputPdf.setTitle("");
  outputPdf.setAuthor("");
  outputPdf.setSubject("");
  outputPdf.setKeywords([]);
  outputPdf.setCreator("");
  outputPdf.setProducer("");

  const scale = Math.max(0.5, dpi / 72);
  const jpegQuality = Math.max(0.1, Math.min(1, quality / 100));

  for (let i = 1; i <= sourcePdf.numPages; i++) {
    const page = await sourcePdf.getPage(i);
    const baseViewport = page.getViewport({ scale: 1 });
    const renderViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw new Error(t ? t("canvasError") : "Unable to get canvas context");
    }

    canvas.width = Math.max(1, Math.floor(renderViewport.width));
    canvas.height = Math.max(1, Math.floor(renderViewport.height));

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({ canvas, viewport: renderViewport }).promise;

    const jpegBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", jpegQuality)
    );
    if (!jpegBlob) {
      throw new Error(t ? t("jpegEncodingError") : "JPEG encoding failed");
    }

    const jpegBytes = await jpegBlob.arrayBuffer();
    const image = await outputPdf.embedJpg(jpegBytes);

    const pageWidth = baseViewport.width;
    const pageHeight = baseViewport.height;
    const newPage = outputPdf.addPage([pageWidth, pageHeight]);
    newPage.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
    });

    page.cleanup();
  }

  const newBytes = await outputPdf.save({ useObjectStreams: true });
  const compressedBlob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });

  if (compressedBlob.size >= originalSize * 0.95) {
    return compressPdfStructure(file);
  }

  return compressedBlob;
}
