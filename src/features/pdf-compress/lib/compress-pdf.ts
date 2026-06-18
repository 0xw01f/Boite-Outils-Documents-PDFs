"use client";

import { PDFDocument } from "pdf-lib";
import type * as PdfjsType from "pdfjs-dist";

export type CompressMode = "structure" | "strong";

export interface CompressOptions {
  mode: CompressMode;
  quality: number; // 0-100
  dpi?: number; // for strong mode
}

const DEFAULT_DPI = 150;
const MAX_PAGES = 200;

async function loadPdfJs(): Promise<typeof PdfjsType> {
  if (typeof window === "undefined") {
    throw new Error("pdfjs-dist can only be loaded in the browser");
  }
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjsLib;
}

export async function compressPdf(file: File, options: CompressOptions): Promise<Blob> {
  if (options.mode === "strong") {
    return compressPdfStrong(file, options.quality, options.dpi ?? DEFAULT_DPI);
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

async function compressPdfStrong(file: File, quality: number, dpi: number): Promise<Blob> {
  const originalSize = file.size;
  const pdfjsLib = await loadPdfJs();
  const bytes = await file.arrayBuffer();
  const sourcePdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  if (sourcePdf.numPages > MAX_PAGES) {
    throw new Error(`PDF trop volumineux (max ${MAX_PAGES} pages)`);
  }

  const outputPdf = await PDFDocument.create();
  // Strip metadata from the start
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
      throw new Error("Impossible d'obtenir le contexte canvas");
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
      throw new Error("Échec de l'encodage JPEG");
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

  // If rasterization did not reduce the size (e.g. text-only PDFs), fall back
  // to structure-only compression to avoid making the file larger.
  if (compressedBlob.size >= originalSize * 0.95) {
    return compressPdfStructure(file);
  }

  return compressedBlob;
}
