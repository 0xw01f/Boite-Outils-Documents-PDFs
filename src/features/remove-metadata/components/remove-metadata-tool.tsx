"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, Eraser } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function RemoveMetadataTool() {
  const [files, setFiles] = useState<File[]>([]);
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

  const removeMetadata = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });

      pdf.setTitle("");
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      pdf.setCreator("");
      pdf.setProducer("");
      pdf.setCreationDate(new Date(0));
      pdf.setModificationDate(new Date(0));
      const newBytes = await pdf.save();
      const blob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError("Erreur lors de la suppression des métadonnées.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Supprimer les métadonnées"
      description="Nettoyez les métadonnées d'un PDF (auteur, titre, etc.)."
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

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={removeMetadata}
            disabled={files.length === 0 || processing}
            className="w-full sm:w-auto"
          >
            <Eraser className="h-4 w-4 mr-2" />
            {processing ? "Traitement..." : "Nettoyer"}
          </Button>

          {resultUrl && (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a href={resultUrl} download="cleaned.pdf">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </a>
            </Button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
