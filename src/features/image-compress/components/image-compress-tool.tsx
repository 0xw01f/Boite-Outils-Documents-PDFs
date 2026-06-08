"use client";

import { useState, useCallback, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";

export function ImageCompressTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState([80]);
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

  const compressImage = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const originalSize = file.size;

      const options = {
        maxSizeMB: file.size / 1024 / 1024,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        fileType: file.type,
        initialQuality: quality[0] / 100,
      };

      const compressedFile = await imageCompression(file, options);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(compressedFile);
      setResultUrl(url);
      setCompressionInfo({
        original: originalSize,
        compressed: compressedFile.size,
      });
    } catch (err) {
      setError("Erreur lors de la compression.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Compresser une image"
      description="Réduisez la taille de vos images tout en conservant la qualité."
    >
      <div className="space-y-6">
        <FileDropZone
          accept="image/*"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => setFiles([])}
        />

        {files.length > 0 && (
          <div>
            <Label>Qualité ({quality[0]}%)</Label>
            <Slider
              value={quality}
              onValueChange={setQuality}
              max={100}
              step={5}
            />
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
            <p className="text-sm font-medium">Résultat :</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Taille originale</p>
                <p className="font-medium">{(compressionInfo.original / 1024).toFixed(1)} KB</p>
              </div>
              <div>
                <p className="text-muted-foreground">Taille compressée</p>
                <p className="font-medium">{(compressionInfo.compressed / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={compressImage}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? "Compression..." : "Compresser"}
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
