"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";
import {
  WATERMARK_MAX_LENGTH,
  applyWatermark,
  drawTiledWatermark,
  isSupportedWatermarkFile,
} from "@/features/watermark/lib/apply-watermark";

const ACCEPT =
  ".jpg,.jpeg,.png,.heic,.heif,.pdf,image/jpeg,image/png,image/heic,image/heif,application/pdf";

export function WatermarkTool() {
  const t = useTranslations("tool.watermark");
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("CECI EST UN FILIGRANE");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("watermarked.pdf");
  const [resultType, setResultType] = useState<"pdf" | "image">("pdf");
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    drawTiledWatermark(ctx, width, height, text);
  }, [text]);

  const handleFilesSelected = useCallback(
    (newFiles: File[]) => {
      const valid = newFiles.filter(isSupportedWatermarkFile);
      if (valid.length === 0 && newFiles.length > 0) {
        setError(t("unsupportedError"));
        setFiles([]);
        return;
      }
      setFiles(valid.slice(0, 1));
      setError(null);
      setResultUrl(null);
    },
    [t]
  );

  const run = async () => {
    if (files.length === 0) {
      setError(t("noFileError"));
      return;
    }
    if (!text.trim()) {
      setError(t("emptyTextError"));
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      const result = await applyWatermark(files[0], text);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(result.blob));
      setResultName(result.fileName);
      setResultType(result.previewType);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message === "empty") {
        setError(t("emptyTextError"));
      } else {
        setError(t("error", { message }));
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div className="space-y-6">
        <FileDropZone
          accept={ACCEPT}
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => {
            setFiles([]);
            setResultUrl(null);
          }}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="watermark-text">{t("textLabel")}</Label>
            <span className="text-xs text-muted-foreground">
              {t("charCount", { current: text.length, max: WATERMARK_MAX_LENGTH })}
            </span>
          </div>
          <Input
            id="watermark-text"
            value={text}
            maxLength={WATERMARK_MAX_LENGTH}
            onChange={(e) => setText(e.target.value.slice(0, WATERMARK_MAX_LENGTH))}
            placeholder={t("textPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label>{t("previewLabel")}</Label>
          <div className="overflow-hidden rounded-md border bg-white">
            <canvas
              ref={previewRef}
              width={720}
              height={420}
              className="block h-auto w-full"
              aria-hidden
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={run} disabled={files.length === 0 || processing || !text.trim()}>
          {processing ? t("processing") : t("action")}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type={resultType}
            fileName={resultName}
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
