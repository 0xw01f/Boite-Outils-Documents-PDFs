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

export function PdfReorderTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [pages, setPages] = useState<{ num: number; name: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    const file = newFiles[0];
    if (!file) return;

    setFiles([file]);
    setPdfUrl(URL.createObjectURL(file));
    setError(null);
    setResultUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
      const count = pdf.getPageCount();
      const initialOrder = Array.from({ length: count }, (_, i) => i);
      setPageOrder(initialOrder);
      setPages(Array.from({ length: count }, (_, i) => ({ num: i, name: `Page ${i + 1}` })));
    } catch {
      setError("Impossible de lire le PDF.");
    }
  }, []);

  const reorderPdf = async () => {
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
      const newPdf = await PDFDocument.create({ updateMetadata: false });

      const copiedPages = await newPdf.copyPages(pdf, pageOrder);
      copiedPages.forEach((page) => newPdf.addPage(page));

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
      setError("Erreur lors de la réorganisation.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Réorganiser les pages"
      description="Changez l'ordre des pages d'un PDF par glisser-déposer."
    >
      <div className="space-y-6">
        <FileDropZone
          accept=".pdf,application/pdf"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => { setFiles([]); setPdfUrl(null); setPageOrder([]); setPages([]); }}
        />

        {pdfUrl && (
          <PdfPageGrid
            pdfUrl={pdfUrl}
            selectedPages={[]}
            pageOrder={pageOrder}
            onSelectionChange={() => {}}
            onOrderChange={setPageOrder}
            mode="reorder"
          />
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={reorderPdf}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? "Traitement..." : "Réorganiser"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="pdf"
            fileName="reordered.pdf"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
