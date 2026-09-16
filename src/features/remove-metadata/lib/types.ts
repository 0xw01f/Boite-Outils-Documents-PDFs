import { cleanText } from "@/lib/sanitize";

export const METADATA_FIELD_MAX = 500;

export type MetadataKind = "pdf" | "jpeg" | "png" | "webp" | "heic" | "gif" | "office";

export type FileMetadata = {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  copyright: string;
  creationDate: string;
  modificationDate: string;
  gps: string;
};

export const EMPTY_METADATA: FileMetadata = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
  copyright: "",
  creationDate: "",
  modificationDate: "",
  gps: "",
};

export type WriteResult = {
  blob: Blob;
  fileName: string;
  previewType: "pdf" | "image" | "file";
};

const BLOCKED_EXT =
  /\.(svgz?|html?|xhtml|xml|js|mjs|cjs|ts|tsx|jsx|wasm|exe|dll|so|bat|cmd|ps1|sh|php|py|docm|dotm|xlsm|xltm|pptm|potm|doc|xls|ppt)$/i;
const BLOCKED_TYPE =
  /^(image\/svg\+xml|text\/html|application\/xhtml\+xml|application\/(javascript|wasm)|text\/(javascript|xml)|application\/xml)/i;

export function isBlockedMetadataFile(file: File): boolean {
  return BLOCKED_EXT.test(file.name) || BLOCKED_TYPE.test(file.type);
}

export function detectKind(file: File): MetadataKind | null {
  if (isBlockedMetadataFile(file)) return null;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (type === "image/jpeg" || name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpeg";
  if (type === "image/png" || name.endsWith(".png")) return "png";
  if (type === "image/webp" || name.endsWith(".webp")) return "webp";
  if (type === "image/gif" || name.endsWith(".gif")) return "gif";
  if (/image\/hei[cf]/.test(type) || /\.hei[cf]$/.test(name)) return "heic";
  if (
    name.endsWith(".docx") ||
    name.endsWith(".xlsx") ||
    name.endsWith(".pptx") ||
    type.includes("officedocument")
  ) {
    return "office";
  }
  return null;
}

export function clampField(value: string): string {
  return cleanText(value).slice(0, METADATA_FIELD_MAX);
}

export function sanitizeMetadata(meta: FileMetadata): FileMetadata {
  return {
    title: clampField(meta.title),
    author: clampField(meta.author),
    subject: clampField(meta.subject),
    keywords: clampField(meta.keywords),
    creator: clampField(meta.creator),
    producer: clampField(meta.producer),
    copyright: clampField(meta.copyright),
    creationDate: "",
    modificationDate: "",
    gps: "",
  };
}

export function outputName(original: string, extension?: string): string {
  if (extension) {
    const base = original.replace(/\.[^.]+$/, "") || "document";
    return `${base}_meta.${extension}`;
  }
  const dot = original.lastIndexOf(".");
  if (dot <= 0) return `${original}_meta`;
  return `${original.slice(0, dot)}_meta${original.slice(dot)}`;
}
