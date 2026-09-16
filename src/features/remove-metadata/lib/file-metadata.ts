"use client";

import { PDFDocument } from "pdf-lib";
import exifr from "exifr";
import {
  EMPTY_METADATA,
  METADATA_FIELD_MAX,
  detectKind,
  isBlockedMetadataFile,
  outputName,
  sanitizeMetadata,
  type FileMetadata,
  type MetadataKind,
  type WriteResult,
} from "@/features/remove-metadata/lib/types";
import { readPngText, writePngText } from "@/features/remove-metadata/lib/png";
import { stripJpegExif, writeJpegExif } from "@/features/remove-metadata/lib/jpeg";
import { readOfficeMetadata, writeOfficeMetadata } from "@/features/remove-metadata/lib/office";

export { detectKind, isBlockedMetadataFile, EMPTY_METADATA, METADATA_FIELD_MAX };
export type { FileMetadata, MetadataKind, WriteResult };

function mergeExif(parsed: Record<string, unknown> | undefined): FileMetadata {
  const meta = { ...EMPTY_METADATA };
  if (!parsed) return meta;
  const str = (...keys: string[]) => {
    for (const key of keys) {
      const value = parsed[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
  };
  meta.title = str("ImageDescription", "title", "Title", "documentTitle");
  meta.author = str("Artist", "author", "Creator", "copyrightHolder");
  meta.subject = str("UserComment", "Description", "subject");
  meta.keywords = str("XPComment", "Keywords", "keywords");
  meta.creator = str("Software", "ProcessingSoftware");
  meta.copyright = str("Copyright", "Rights", "copyright");
  const created = parsed.DateTimeOriginal || parsed.CreateDate || parsed.DateTime;
  if (created instanceof Date) meta.creationDate = created.toISOString();
  else if (typeof created === "string") meta.creationDate = created;
  const lat = parsed.latitude;
  const lng = parsed.longitude;
  if (typeof lat === "number" && typeof lng === "number") {
    meta.gps = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
  return meta;
}

export async function readFileMetadata(file: File): Promise<{ kind: MetadataKind; metadata: FileMetadata }> {
  const kind = detectKind(file);
  if (!kind) throw new Error("unsupported");
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (kind === "pdf") {
    const pdf = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: false });
    const rawKeywords = pdf.getKeywords();
    return {
      kind,
      metadata: {
        ...EMPTY_METADATA,
        title: pdf.getTitle() || "",
        author: pdf.getAuthor() || "",
        subject: pdf.getSubject() || "",
        keywords: Array.isArray(rawKeywords) ? rawKeywords.join(", ") : rawKeywords ? String(rawKeywords) : "",
        creator: pdf.getCreator() || "",
        producer: pdf.getProducer() || "",
        creationDate: pdf.getCreationDate()?.toISOString?.() || "",
        modificationDate: pdf.getModificationDate()?.toISOString?.() || "",
      },
    };
  }

  if (kind === "png") {
    const text = readPngText(bytes);
    const parsed = (await exifr.parse(file, { gps: true }).catch(() => undefined)) as
      | Record<string, unknown>
      | undefined;
    const fromExif = mergeExif(parsed);
    return {
      kind,
      metadata: {
        ...EMPTY_METADATA,
        title: text.Title || fromExif.title,
        author: text.Author || fromExif.author,
        subject: text.Description || fromExif.subject,
        keywords: text.Comment || fromExif.keywords,
        creator: text.Software || fromExif.creator,
        copyright: text.Copyright || fromExif.copyright,
        gps: fromExif.gps,
        creationDate: fromExif.creationDate,
      },
    };
  }

  if (kind === "office") {
    return { kind, metadata: { ...EMPTY_METADATA, ...(await readOfficeMetadata(bytes.buffer as ArrayBuffer)) } };
  }

  const parsed = (await exifr.parse(file, { gps: true, xmp: true, iptc: false }).catch(() => undefined)) as
    | Record<string, unknown>
    | undefined;
  return { kind, metadata: mergeExif(parsed) };
}

async function writePdf(file: File, meta: FileMetadata): Promise<WriteResult> {
  const pdf = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
  pdf.setTitle(meta.title);
  pdf.setAuthor(meta.author);
  pdf.setSubject(meta.subject);
  pdf.setKeywords(meta.keywords ? meta.keywords.split(",").map((k) => k.trim()).filter(Boolean) : []);
  pdf.setCreator(meta.creator);
  pdf.setProducer(meta.producer);
  pdf.setModificationDate(new Date());
  if (!meta.creationDate) pdf.setCreationDate(new Date(0));
  const newBytes = await pdf.save();
  return {
    blob: new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" }),
    fileName: outputName(file.name),
    previewType: "pdf",
  };
}

export async function writeFileMetadata(file: File, rawMeta: FileMetadata): Promise<WriteResult> {
  const kind = detectKind(file);
  if (!kind) throw new Error("unsupported");
  const meta = sanitizeMetadata(rawMeta);
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (kind === "pdf") return writePdf(file, meta);

  if (kind === "jpeg") {
    const out = writeJpegExif(bytes, meta);
    return {
      blob: new Blob([out.buffer as ArrayBuffer], { type: "image/jpeg" }),
      fileName: outputName(file.name),
      previewType: "image",
    };
  }

  if (kind === "png") {
    const out = writePngText(bytes, {
      Title: meta.title,
      Author: meta.author,
      Description: meta.subject,
      Comment: meta.keywords,
      Software: meta.creator,
      Copyright: meta.copyright,
    });
    return {
      blob: new Blob([out.buffer as ArrayBuffer], { type: "image/png" }),
      fileName: outputName(file.name),
      previewType: "image",
    };
  }

  if (kind === "office") {
    const out = await writeOfficeMetadata(bytes.buffer as ArrayBuffer, meta);
    return {
      blob: new Blob([out.buffer as ArrayBuffer], { type: file.type || "application/octet-stream" }),
      fileName: outputName(file.name),
      previewType: "file",
    };
  }

  const jpeg = writeJpegExif(stripJpegExif(await rasterToJpeg(file)), meta);
  return {
    blob: new Blob([jpeg.buffer as ArrayBuffer], { type: "image/jpeg" }),
    fileName: outputName(file.name, "jpg"),
    previewType: "image",
  };
}

async function rasterToJpeg(file: File): Promise<Uint8Array> {
  let blob: Blob = file;
  if (detectKind(file) === "heic") {
    const heic2any = (await import("heic2any")).default as (options: {
      blob: Blob;
      toType?: string;
    }) => Promise<Blob | Blob[]>;
    const converted = await heic2any({ blob: file, toType: "image/jpeg" });
    blob = Array.isArray(converted) ? converted[0] : converted;
  }

  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width === 0) throw new Error("image");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const binary = atob(dataUrl.split(",")[1] || "");
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}
