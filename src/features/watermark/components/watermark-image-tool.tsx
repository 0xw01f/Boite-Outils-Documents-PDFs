"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";

export function WatermarkImageTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("CONFIDENTIEL");
  const [opacity, setOpacity] = useState([50]);
  const [fontSize, setFontSize] = useState([48]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const addWatermark = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    if (!text.trim()) {
      setError("Veuillez entrer un texte de filigrane.");
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

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.font = `${fontSize[0]}px Arial`;
      ctx.fillStyle = `rgba(128, 128, 128, ${opacity[0] / 100})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 0, 0);
      ctx.restore();

      const resultDataUrl = canvas.toDataURL(file.type);
      const blob = await fetch(resultDataUrl).then((r) => r.blob());
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError("Erreur lors de l'ajout du filigrane.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Filigrane Image"
      description="Ajoutez un filigrane texte à vos images."
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
            <div>
              <Label htmlFor="watermark-text">Texte du filigrane</Label>
              <Input
                id="watermark-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="CONFIDENTIEL"
              />
            </div>
            
            <div>
              <Label>Taille de police ({fontSize[0]}px)</Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={12}
                max={200}
                step={4}
              />
            </div>
            
            <div>
              <Label>Opacité ({opacity[0]}%)</Label>
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                max={100}
                step={5}
              />
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={addWatermark}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? "Traitement..." : "Ajouter le filigrane"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="image"
            fileName="watermarked-image.png"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
