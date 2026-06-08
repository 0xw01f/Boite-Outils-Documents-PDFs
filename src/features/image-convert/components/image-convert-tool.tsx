"use client";

import { useState, useCallback, useEffect } from "react";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";

export function ImageConvertTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("png");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1));
    setError(null);
    setResultUrl(null);
  }, []);

  const convertImage = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const img = new Image();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("Impossible de lire l'image"));
        reader.readAsDataURL(file);
      });

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.src = dataUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (format === "jpg" || format === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
      const resultDataUrl = canvas.toDataURL(mimeType, 0.92);
      const blob = await fetch(resultDataUrl).then((r) => r.blob());
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError("Erreur lors de la conversion.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Convertir le format"
      description="Changez le format de vos images (JPG, PNG, WebP)."
    >
      <div className="space-y-6">
        <FileDropZone
          accept="image/*"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => setFiles([])}
        />

        {files.length > 0 && (
          <div className="space-y-3">
            <Label>Format de sortie</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={convertImage}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? "Conversion..." : "Convertir"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="image"
            fileName={`converted.${format}`}
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
