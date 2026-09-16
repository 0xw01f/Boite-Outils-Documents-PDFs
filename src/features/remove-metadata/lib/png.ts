function crcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = crcTable();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10];
const DROP_TYPES = new Set(["tEXt", "iTXt", "zTXt", "eXIf", "tIME"]);

function readChunks(bytes: Uint8Array) {
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIG[i]) throw new Error("png");
  }
  const chunks: { type: string; data: Uint8Array }[] = [];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0);
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) break;
    chunks.push({ type, data: bytes.subarray(dataStart, dataEnd) });
    offset = dataEnd + 4;
    if (type === "IEND") break;
  }
  return chunks;
}

function encodeChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcBytes = out.subarray(4, 8 + data.length);
  view.setUint32(8 + data.length, crc32(crcBytes));
  return out;
}

function latin1(text: string): Uint8Array {
  const chars = Array.from(text);
  const out = new Uint8Array(chars.length);
  for (let i = 0; i < chars.length; i++) {
    const code = chars[i].charCodeAt(0);
    out[i] = code > 255 ? 63 : code;
  }
  return out;
}

function textChunk(keyword: string, value: string): Uint8Array {
  const key = latin1(keyword);
  const val = latin1(value);
  const data = new Uint8Array(key.length + 1 + val.length);
  data.set(key, 0);
  data[key.length] = 0;
  data.set(val, key.length + 1);
  return encodeChunk("tEXt", data);
}

export function readPngText(bytes: Uint8Array): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const chunk of readChunks(bytes)) {
    if (chunk.type !== "tEXt") continue;
    const zero = chunk.data.indexOf(0);
    if (zero <= 0) continue;
    const key = String.fromCharCode(...chunk.data.subarray(0, zero));
    const value = String.fromCharCode(...chunk.data.subarray(zero + 1));
    fields[key] = value;
  }
  return fields;
}

export function writePngText(bytes: Uint8Array, fields: Record<string, string>): Uint8Array {
  const chunks = readChunks(bytes);
  const kept = chunks.filter((c) => !DROP_TYPES.has(c.type));
  const ihdr = kept.findIndex((c) => c.type === "IHDR");
  const insertAt = ihdr >= 0 ? ihdr + 1 : 0;
  const extras: Uint8Array[] = [];
  for (const [keyword, value] of Object.entries(fields)) {
    if (!value) continue;
    extras.push(textChunk(keyword, value));
  }

  const encodedKept = kept.map((c) => encodeChunk(c.type, c.data));
  const parts = [
    new Uint8Array(PNG_SIG),
    ...encodedKept.slice(0, insertAt),
    ...extras,
    ...encodedKept.slice(insertAt),
  ];
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}
