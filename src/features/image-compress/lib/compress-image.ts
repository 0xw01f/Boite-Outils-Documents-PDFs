"use client";

import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";

export type CompressionLevel = "light" | "medium" | "strong" | "custom";

export interface ImageCompressOptions {
  level: CompressionLevel;
  quality: number; // 0-100, used when custom
  convertPngToJpeg: boolean;
}

const levelPresets: Record<
  Exclude<CompressionLevel, "custom">,
  { quality: number; maxWidthOrHeight: number; sizeRatio: number }
> = {
  light: {
    quality: 90,
    maxWidthOrHeight: 4096,
    sizeRatio: 0.8,
  },
  medium: {
    quality: 75,
    maxWidthOrHeight: 2048,
    sizeRatio: 0.35,
  },
  strong: {
    quality: 60,
    maxWidthOrHeight: 1600,
    sizeRatio: 0.12,
  },
};

export function getLevelLabel(level: CompressionLevel, t: ReturnType<typeof useTranslations>): string {
  if (level === "custom") return t("levelCustom");
  return t(`level${level.charAt(0).toUpperCase() + level.slice(1)}`);
}

export async function compressImage(file: File, options: ImageCompressOptions): Promise<File> {
  const originalSizeMB = file.size / 1024 / 1024;
  const preset = options.level === "custom" ? null : levelPresets[options.level];

  const quality = preset ? preset.quality : options.quality;
  const maxWidthOrHeight = preset ? preset.maxWidthOrHeight : 4096;

  // maxSizeMB is a target upper bound. browser-image-compression will lower
  // quality and/or resolution until the file is below this size.
  const maxSizeMB = preset
    ? Math.max(0.05, originalSizeMB * preset.sizeRatio)
    : Math.max(0.05, originalSizeMB * 0.5);

  const isPng = file.type === "image/png";
  const outputType = isPng && options.convertPngToJpeg ? "image/jpeg" : file.type;

  const compressionOptions = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: outputType,
    initialQuality: quality / 100,
    alwaysKeepResolution: false,
  };

  return imageCompression(file, compressionOptions);
}
