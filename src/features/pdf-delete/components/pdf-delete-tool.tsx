"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";
import { PdfPageGrid } from "@/components/pdf-page-grid";

export function PdfDeleteTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const file = newFiles[0];
    if (!file) return;

    setFiles([file]);
    setPdfUrl(URL.createObjectURL(file));
    setSelectedPages([]);
    setError(null);
    setResultUrl(null);
  }, []);

  const deletePages = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    if (selectedPages.length === 0) {
      setError("Veuillez sélectionner au moins une page à supprimer.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
      const totalPages = pdf.getPageCount();
      const deleteSet = new Set(selectedPages);

      const pagesToKeep = [];
      for (let i = 0; i < totalPages; i++) {
        if (!deleteSet.has(i)) {
          pagesToKeep.push(i);
        }
      }

      if (pagesToKeep.length === 0) {
        setError("Vous ne pouvez pas supprimer toutes les pages.");
        setProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create({ updateMetadata: false });
      const pages = await newPdf.copyPages(pdf, pagesToKeep);
      pages.forEach((page) => newPdf.addPage(page));

      newPdf.setTitle("");
      newPdf.setAuthor("");
      newPdf.setSubject("");
      newPdf.setKeywords([]);
      newPdf.setCreator("");
      newPdf.setProducer("");
      const newBytes = await newPdf.save();
      const blob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      setError("Erreur lors de la suppression des pages.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Supprimer des pages"
      description="Supprimez des pages spécifiques d'un PDF."
    >
      <div className="space-y-6">
        <FileDropZone
          accept=".pdf,application/pdf"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => { setFiles([]); setPdfUrl(null); setSelectedPages([]); }}
        />

        {pdfUrl && (
          <PdfPageGrid
            pdfUrl={pdfUrl}
            selectedPages={selectedPages}
            pageOrder={[]}
            onSelectionChange={setSelectedPages}
            onOrderChange={() => {}}
            mode="select"
          />
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={deletePages}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
          variant="destructive"
        >
          {processing ? "Traitement..." : "Supprimer les pages"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="pdf"
            fileName="modified.pdf"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
