"use client";

import { useState, useCallback, useEffect } from "react";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { compressPdf, type CompressMode } from "@/features/pdf-compress/lib/compress-pdf";

export function PdfCompressTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [mode, setMode] = useState<CompressMode>("strong");
  const [quality, setQuality] = useState([70]);
  const [dpi, setDpi] = useState([150]);
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
      setError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const originalSize = file.size;

      const blob = await compressPdf(file, {
        mode,
        quality: quality[0],
        dpi: dpi[0],
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setCompressionInfo({
        original: originalSize || 1,
        compressed: blob.size,
      });
    } catch (err: any) {
      console.error(err);
      setError(`Erreur lors de la compression : ${err?.message || "Vérifiez que le PDF est valide."}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Compresser un PDF"
      description="Réduisez fortement la taille d'un PDF en récompressant ses images."
    >
      <div className="space-y-6">
        <FileDropZone
          accept=".pdf,application/pdf"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => setFiles([])}
        />

        {files.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <Label>Mode de compression</Label>
              <Select value={mode} onValueChange={(value) => setMode(value as CompressMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strong">Fort (recommandé)</SelectItem>
                  <SelectItem value="structure">Structure uniquement</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {mode === "strong"
                  ? "Recompresse chaque page en image JPEG. Gains importants mais le texte n'est plus sélectionnable."
                  : "Garde le texte sélectionnable mais ne compresse que la structure (métadonnées, streams)."}
              </p>
            </div>

            {mode === "strong" && (
              <>
                <div className="space-y-3">
                  <Label>Qualité JPEG ({quality[0]}%)</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    min={30}
                    max={100}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    60-80% offre le meilleur compromis taille / qualité.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Résolution de sortie ({dpi[0]} DPI)</Label>
                  <Slider
                    value={dpi}
                    onValueChange={setDpi}
                    min={72}
                    max={300}
                    step={12}
                  />
                  <p className="text-xs text-muted-foreground">
                    150 DPI suffit pour la plupart des usages web et mail.
                  </p>
                </div>
              </>
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
            <p className="text-sm font-medium">Résultat de la compression :</p>
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
            <p className="text-sm text-green-600 font-medium">
              Réduction : {((1 - compressionInfo.compressed / compressionInfo.original) * 100).toFixed(1)}%
            </p>
          </div>
        )}

        <Button
          onClick={handleCompress}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? "Compression..." : "Compresser"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="pdf"
            fileName="compressed.pdf"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
