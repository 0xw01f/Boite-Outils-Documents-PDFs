"use client";

import { useTranslations } from "next-intl";

import { useState, useCallback, useEffect } from "react";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";
import {
  compressImage,
  type CompressionLevel,
  getLevelLabel,
} from "@/features/image-compress/lib/compress-image";

export function ImageCompressTool() {
  const t = useTranslations("tool.compressImage");
  const tCommon = useTranslations("common");
  const [files, setFiles] = useState<File[]>([]);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [quality, setQuality] = useState([75]);
  const [convertPngToJpeg, setConvertPngToJpeg] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<{ original: number; compressed: number } | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1));
    setError(null);
    setResultUrl(null);
    setCompressionInfo(null);
  }, []);

  const handleCompress = async () => {
    if (files.length === 0) {
      setError(t("noFileError"));
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const originalSize = file.size;

      const compressedFile = await compressImage(file, {
        level,
        quality: quality[0],
        convertPngToJpeg,
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(compressedFile);
      setResultUrl(url);
      setCompressionInfo({
        original: originalSize,
        compressed: compressedFile.size,
      });
    } catch (err: unknown) {
      console.error(err);
      setError(t("error", { message: err instanceof Error ? err.message : "" }));
    } finally {
      setProcessing(false);
    }
  };

  const isPng = files[0]?.type === "image/png";

  return (
    <ToolLayout
      title={t("title")}
      description={t("description")}
    >
      <div className="space-y-6">
        <FileDropZone
          accept="image/*"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => setFiles([])}
        />

        {files.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label>{t("levelLabel")}</Label>
              <Select value={level} onValueChange={(value) => setLevel(value as CompressionLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t("levelLight")}</SelectItem>
                  <SelectItem value="medium">{t("levelMedium")}</SelectItem>
                  <SelectItem value="strong">{t("levelStrong")}</SelectItem>
                  <SelectItem value="custom">{t("levelCustom")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {level === "light" && t("lightHint")}
                {level === "medium" && t("mediumHint")}
                {level === "strong" && t("strongHint")}
                {level === "custom" && t("customHint")}
              </p>
            </div>

            {level === "custom" && (
              <div className="space-y-3">
                <Label>{t("qualityLabel", { value: quality[0] })}</Label>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  max={100}
                  step={5}
                />
              </div>
            )}

            {isPng && (
              <div className="flex items-center justify-between rounded-lg border p-4 sm:col-span-2">
                <div className="space-y-0.5">
                  <Label>{t("convertPngToJpeg")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("convertHint")}
                  </p>
                </div>
                <Switch
                  checked={convertPngToJpeg}
                  onCheckedChange={setConvertPngToJpeg}
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {compressionInfo && (
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <p className="text-sm font-medium">
              {t("resultTitle", { level: getLevelLabel(level, t) })}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{tCommon("originalSize")}</p>
                <p className="font-medium">{(compressionInfo.original / 1024).toFixed(1)} KB</p>
              </div>
              <div>
                <p className="text-muted-foreground">{tCommon("compressedSize")}</p>
                <p className="font-medium">{(compressionInfo.compressed / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium">
              {tCommon("reduction", { percentage: ((1 - compressionInfo.compressed / compressionInfo.original) * 100).toFixed(1) })}
            </p>
          </div>
        )}

        <Button
          onClick={handleCompress}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? t("processing") : t("action")}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="image"
            fileName="compressed-image.jpg"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
