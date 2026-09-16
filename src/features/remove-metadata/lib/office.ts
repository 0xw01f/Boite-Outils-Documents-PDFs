import JSZip from "jszip";
import { clampField, type FileMetadata } from "@/features/remove-metadata/lib/types";

const CORE = "docProps/core.xml";
const DC = "http://purl.org/dc/elements/1.1/";
const CP = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties";
const DCTERMS = "http://purl.org/dc/terms/";
const MAX_FILES = 4000;
const MAX_UNCOMPRESSED = 80 * 1024 * 1024;

function xmlEscape(value: string): string {
  return clampField(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tag(nsPrefix: string, name: string, value: string): string {
  const safe = xmlEscape(value);
  if (!safe) return "";
  return `<${nsPrefix}:${name}>${safe}</${nsPrefix}:${name}>`;
}

function readTag(xml: string, name: string): string {
  const match = xml.match(new RegExp(`<(?:\\w+:)?${name}[^>]*>([\\s\\S]*?)</(?:\\w+:)?${name}>`, "i"));
  if (!match) return "";
  return match[1]
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
}

function isUnsafePath(name: string): boolean {
  const normalized = name.replace(/\\/g, "/");
  return normalized.startsWith("/") || normalized.includes("..") || /^[a-zA-Z]:/.test(normalized);
}

function uncompressedSize(file: JSZip.JSZipObject): number {
  const data = (file as JSZip.JSZipObject & { _data?: { uncompressedSize?: number } })._data;
  return typeof data?.uncompressedSize === "number" ? data.uncompressedSize : 0;
}

async function loadOfficeZip(bytes: ArrayBuffer): Promise<JSZip> {
  const zip = await JSZip.loadAsync(bytes, { checkCRC32: true });
  const names = Object.keys(zip.files);
  if (names.length > MAX_FILES) throw new Error("office");
  let total = 0;
  for (const name of names) {
    if (isUnsafePath(name)) throw new Error("office");
    total += uncompressedSize(zip.files[name]);
    if (total > MAX_UNCOMPRESSED) throw new Error("office");
  }
  return zip;
}

function stripMacros(zip: JSZip) {
  for (const name of Object.keys(zip.files)) {
    if (/vbaProject|vbaData/i.test(name)) zip.remove(name);
  }
  zip.remove("docProps/custom.xml");
}

export async function readOfficeMetadata(bytes: ArrayBuffer): Promise<Partial<FileMetadata>> {
  const zip = await loadOfficeZip(bytes);
  const coreFile = zip.file(CORE);
  if (!coreFile) return {};
  const xml = await coreFile.async("string");
  if (/<!DOCTYPE|<\?php|<script/i.test(xml) || xml.length > 200_000) return {};
  return {
    title: readTag(xml, "title"),
    author: readTag(xml, "creator"),
    subject: readTag(xml, "subject"),
    keywords: readTag(xml, "keywords"),
    creator: readTag(xml, "lastModifiedBy"),
    creationDate: readTag(xml, "created"),
    modificationDate: readTag(xml, "modified"),
  };
}

export async function writeOfficeMetadata(bytes: ArrayBuffer, meta: FileMetadata): Promise<Uint8Array> {
  const zip = await loadOfficeZip(bytes);
  stripMacros(zip);
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="${CP}" xmlns:dc="${DC}" xmlns:dcterms="${DCTERMS}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${tag("dc", "title", meta.title)}${tag("dc", "creator", meta.author)}${tag("dc", "subject", meta.subject)}${tag("cp", "keywords", meta.keywords)}</cp:coreProperties>`;
  zip.file(CORE, xml);
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
