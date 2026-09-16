"use client";

import { PDFDocument } from "pdf-lib";

export const WATERMARK_MAX_LENGTH = 100;

const ANGLE_DEG = -38;
const GRAY = { r: 160, g: 160, b: 160, a: 0.42 };
const RED = { r: 224, g: 112, b: 112, a: 0.46 };
const SHADOW = "rgba(0, 0, 0, 0.12)";

export type WatermarkResult = {
  blob: Blob;
  fileName: string;
  previewType: "pdf" | "image";
};

function clampText(text: string): string {
  return text.slice(0, WATERMARK_MAX_LENGTH).trim();
}

function fillSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  letterSpacing: number
) {
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  const total =
    widths.reduce((sum, w) => sum + w, 0) + letterSpacing * Math.max(0, chars.length - 1);
  let cursor = x - total / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], cursor + widths[i] / 2, y);
    cursor += widths[i] + letterSpacing;
  }
}

function measureSpacedWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  letterSpacing: number
): number {
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width);
  return widths.reduce((sum, w) => sum + w, 0) + letterSpacing * Math.max(0, chars.length - 1);
}

export function drawTiledWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string
) {
  const label = clampText(text);
  if (!label) return;

  const minSide = Math.min(width, height);
  const fontSize = Math.max(12, minSide * 0.026);
  const letterSpacing = fontSize * 0.16;
  const shadowOffset = Math.max(1.2, fontSize * 0.07);

  ctx.save();
  ctx.font = `500 ${fontSize}px Helvetica, Arial, "Helvetica Neue", sans-serif`;

  const textWidth = measureSpacedWidth(ctx, label, letterSpacing);
  const colStep = textWidth + fontSize * 3.4;
  const rowStep = fontSize * 5.1;
  const diagonal = Math.hypot(width, height);
  const cols = Math.ceil(diagonal / colStep) + 3;
  const rows = Math.ceil(diagonal / rowStep) + 3;

  ctx.translate(width / 2, height / 2);
  ctx.rotate((ANGLE_DEG * Math.PI) / 180);

  const startX = -((cols - 1) * colStep) / 2;
  const startY = -((rows - 1) * rowStep) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * colStep;
      const y = startY + row * rowStep;
      const color = (row + col) % 2 === 0 ? GRAY : RED;

      ctx.fillStyle = SHADOW;
      fillSpacedText(ctx, label, x + shadowOffset, y + shadowOffset * 1.35, letterSpacing);

      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
      fillSpacedText(ctx, label, x, y, letterSpacing);
    }
  }

  ctx.restore();
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("canvas"));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

async function blobToPngBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function isHeicFile(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

export function isSupportedWatermarkFile(file: File): boolean {
  if (isPdfFile(file) || isHeicFile(file)) return true;
  if (/image\/(jpeg|jpg|png)/i.test(file.type)) return true;
  return /\.(jpe?g|png)$/i.test(file.name);
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  let blob: Blob = file;

  if (isHeicFile(file)) {
    const heic2any = (await import("heic2any")).default as (options: {
      blob: Blob;
      toType?: string;
    }) => Promise<Blob | Blob[]>;
    const converted = await heic2any({ blob: file, toType: "image/png" });
    blob = Array.isArray(converted) ? converted[0] : converted;
  }

  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image"));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function outputName(original: string, extension: string): string {
  const base = original.replace(/\.[^.]+$/, "") || "document";
  return `${base}_filigrane.${extension}`;
}

async function watermarkImage(file: File, text: string): Promise<WatermarkResult> {
  const img = await fileToImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error("image");
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const keepPng = /\.png$/i.test(file.name) || file.type === "image/png";
  if (!keepPng) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  drawTiledWatermark(ctx, canvas.width, canvas.height, text);

  if (keepPng) {
    const blob = await canvasToBlob(canvas, "image/png");
    return { blob, fileName: outputName(file.name, "png"), previewType: "image" };
  }

  const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
  return { blob, fileName: outputName(file.name, "jpg"), previewType: "image" };
}

async function watermarkPdf(file: File, text: string): Promise<WatermarkResult> {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
  const pages = pdf.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const longSide = Math.max(width, height);
    const scale = Math.min(2.4, Math.max(1.6, 1700 / longSide));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.scale(scale, scale);
    drawTiledWatermark(ctx, width, height, text);

    const pngBlob = await canvasToBlob(canvas, "image/png");
    const png = await pdf.embedPng(await blobToPngBytes(pngBlob));
    page.drawImage(png, { x: 0, y: 0, width, height });
  }

  const newBytes = await pdf.save({ useObjectStreams: true });
  return {
    blob: new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" }),
    fileName: outputName(file.name, "pdf"),
    previewType: "pdf",
  };
}

export async function applyWatermark(file: File, text: string): Promise<WatermarkResult> {
  const label = clampText(text);
  if (!label) throw new Error("empty");
  if (isPdfFile(file)) return watermarkPdf(file, label);
  return watermarkImage(file, label);
}
