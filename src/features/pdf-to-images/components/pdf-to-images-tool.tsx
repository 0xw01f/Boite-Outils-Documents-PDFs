"use client";

import { useTranslations } from "next-intl";

import { useState, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";
import JSZip from "jszip";

// Use local worker for reliability
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

export function PdfToImagesTool() {
  const t = useTranslations("tool.pdfToImages");
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState([90]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1));
    setError(null);
    setResultUrl(null);
    setPreviews([]);
  }, []);

  const convertToImages = async () => {
    if (files.length === 0) {
      setError(t("noFileError"));
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      if (pdf.numPages > 200) {
        throw new Error(t("tooManyPagesError"));
      }
      const zip = new JSZip();
      const previewUrls: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = Math.min(3, Math.max(1.5, 1200 / page.getViewport({ scale: 1 }).width));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: format === "png" });

        if (!context) continue;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        // Fill white background for JPG
        if (format === "jpg") {
          context.fillStyle = "#FFFFFF";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({
          canvasContext: context,
          viewport,
          canvas: canvas as unknown as HTMLCanvasElement,
        }).promise;

        const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, quality[0] / 100);
        const base64Data = dataUrl.split(",")[1];
        zip.file(`page-${i.toString().padStart(3, "0")}.${format}`, base64Data, { base64: true });

        if (i <= 8) {
          previewUrls.push(dataUrl);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(zipBlob);
      setResultUrl(url);
      setPreviews(previewUrls);
    } catch (err: unknown) {
      console.error(err);
      setError(t("error", { message: err instanceof Error ? err.message : "" }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title={t("title")}
      description={t("description")}
    >
      <div className="space-y-6">
        <FileDropZone
          accept=".pdf,application/pdf"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => { setFiles([]); setPreviews([]); }}
        />

        {files.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <Label>{t("formatLabel")}</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">{t("formatPng")}</SelectItem>
                  <SelectItem value="jpg">{t("formatJpg")}</SelectItem>
                  <SelectItem value="webp">{t("formatWebp")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {format !== "png" && (
              <div className="space-y-3">
                <Label>{t("qualityLabel", { value: quality[0] })}</Label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={quality[0]}
                  onChange={(e) => setQuality([parseInt(e.target.value)])}
                  className="w-full"
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

        <Button
          onClick={convertToImages}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {processing ? t("processing") : t("action")}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="images"
            fileName="pages.zip"
            onClose={() => setResultUrl(null)}
            imageUrls={previews}
          />
        )}
      </div>
    </ToolLayout>
  );
}
