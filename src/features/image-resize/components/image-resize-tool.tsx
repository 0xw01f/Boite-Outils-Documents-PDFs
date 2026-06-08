"use client";

import { useState, useCallback, useEffect } from "react";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";

export function ImageResizeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainRatio, setMaintainRatio] = useState(true);
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

  const resizeImage = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    const targetWidth = parseInt(width);
    const targetHeight = parseInt(height);

    if (isNaN(targetWidth) || targetWidth <= 0) {
      setError("Veuillez entrer une largeur valide.");
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

      let newWidth = targetWidth;
      let newHeight = targetHeight;

      if (maintainRatio) {
        const ratio = img.width / img.height;
        if (!isNaN(targetHeight) && targetHeight > 0) {
          newWidth = Math.round(targetHeight * ratio);
        } else {
          newHeight = Math.round(targetWidth / ratio);
        }
      } else if (isNaN(targetHeight) || targetHeight <= 0) {
        setError("Veuillez entrer une hauteur valide.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const resultDataUrl = canvas.toDataURL(file.type);
      const blob = await fetch(resultDataUrl).then((r) => r.blob());
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError("Erreur lors du redimensionnement.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Redimensionner"
      description="Changez les dimensions de vos images."
    >
      <div className="space-y-6">
        <FileDropZone
          accept="image/*"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => setFiles([])}
        />

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                id="ratio"
                checked={maintainRatio}
                onCheckedChange={setMaintainRatio}
              />
              <Label htmlFor="ratio">Conserver le ratio</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Largeur (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="800"
                />
              </div>
              <div>
                <Label htmlFor="height">Hauteur (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="600"
                  disabled={maintainRatio}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={resizeImage}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? "Traitement..." : "Redimensionner"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="image"
            fileName="resized-image.png"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
