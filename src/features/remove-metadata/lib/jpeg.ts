import piexif from "piexifjs";
import type { FileMetadata } from "@/features/remove-metadata/lib/types";

function toBinary(bytes: Uint8Array): string {
  let out = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    out += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return out;
}

function fromBinary(binary: string): Uint8Array {
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i) & 0xff;
  return out;
}

export function stripJpegExif(bytes: Uint8Array): Uint8Array {
  const binary = toBinary(bytes);
  try {
    return fromBinary(piexif.remove(binary));
  } catch {
    return bytes;
  }
}

export function writeJpegExif(bytes: Uint8Array, meta: FileMetadata): Uint8Array {
  const stripped = toBinary(stripJpegExif(bytes));
  if (
    !meta.title &&
    !meta.author &&
    !meta.subject &&
    !meta.keywords &&
    !meta.creator &&
    !meta.copyright
  ) {
    return fromBinary(stripped);
  }

  const zeroth: Record<number, string> = {};
  if (meta.creator) zeroth[piexif.ImageIFD.Software] = meta.creator;
  if (meta.author) zeroth[piexif.ImageIFD.Artist] = meta.author;
  if (meta.copyright) zeroth[piexif.ImageIFD.Copyright] = meta.copyright;
  if (meta.title) zeroth[piexif.ImageIFD.ImageDescription] = meta.title;
  if (meta.subject && !meta.title) zeroth[piexif.ImageIFD.ImageDescription] = meta.subject;
  if (meta.keywords && meta.title) {
    zeroth[piexif.ImageIFD.ImageDescription] = `${meta.title} (${meta.keywords})`;
  }

  const dump = piexif.dump({ "0th": zeroth });
  return fromBinary(piexif.insert(dump, stripped));
}
