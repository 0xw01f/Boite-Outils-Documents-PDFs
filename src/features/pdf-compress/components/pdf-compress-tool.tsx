"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";

export function PdfCompressTool() {
  const [files, setFiles] = useState<File[]>([]);
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

  const compressPdf = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const originalSize = file.size;
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });

      pdf.setTitle("");
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      pdf.setCreator("");
      pdf.setProducer("");
      const newBytes = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setCompressionInfo({
        original: originalSize || 1,
        compressed: blob.size,
      });
    } catch (err) {
      setError("Erreur lors de la compression.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Compresser un PDF"
      description="Réduisez la taille d'un PDF en optimisant sa structure."
    >
      <div className="space-y-6">
        <FileDropZone
          accept=".pdf,application/pdf"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => setFiles([])}
        />

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
          onClick={compressPdf}
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
