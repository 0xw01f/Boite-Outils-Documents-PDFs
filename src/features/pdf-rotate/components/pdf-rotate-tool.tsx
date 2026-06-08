"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, RotateCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";

export function PdfRotateTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [rotation, setRotation] = useState("90");
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

  const rotatePdf = async () => {
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
      const pages = pdf.getPages();
      const angle = parseInt(rotation);

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + angle));
      });

      pdf.setTitle("");
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      pdf.setCreator("");
      pdf.setProducer("");
      const newBytes = await pdf.save();
      const blob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError("Erreur lors de la rotation du PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Rotation PDF"
      description="Faites pivoter toutes les pages d'un PDF dans le sens horaire."
    >
      <div className="space-y-6">
        <FileDropZone
          accept=".pdf,application/pdf"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => setFiles([])}
        />

        {files.length > 0 && (
          <div className="space-y-3">
            <Label>Angle de rotation</Label>
            <Select value={rotation} onValueChange={setRotation}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90° (horaire)</SelectItem>
                <SelectItem value="180">180°</SelectItem>
                <SelectItem value="270">270° (anti-horaire)</SelectItem>
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
          onClick={rotatePdf}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          {processing ? "Traitement..." : "Tourner le PDF"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="pdf"
            fileName="rotated.pdf"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
