"use client";

import { useTranslations } from "next-intl";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";
import { PdfPageGrid } from "@/components/pdf-page-grid";

export function SplitPdfTool() {
  const t = useTranslations("tool.splitPdf");
  const [files, setFiles] = useState<File[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    const file = newFiles[0];
    if (!file) return;

    setFiles([file]);
    setPdfUrl(URL.createObjectURL(file));
    setSelectedPages([]);
    setError(null);
    setResultUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
      const count = pdf.getPageCount();
      setPageOrder(Array.from({ length: count }, (_, i) => i));
    } catch {
      setError(t("loadError"));
    }
  }, [t]);

  const splitPdf = async () => {
    if (files.length === 0) {
      setError(t("noFileError"));
      return;
    }

    if (selectedPages.length === 0) {
      setError(t("noPagesError"));
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });

      const orderedSelected = pageOrder.filter((p) => selectedPages.includes(p));

      if (orderedSelected.length === 0) {
        setError(t("noValidPagesError"));
        return;
      }

      const newPdf = await PDFDocument.create({ updateMetadata: false });
      const pages = await newPdf.copyPages(pdf, orderedSelected);
      pages.forEach((page) => newPdf.addPage(page));

      newPdf.setTitle("");
      newPdf.setAuthor("");
      newPdf.setSubject("");
      newPdf.setKeywords([]);
      newPdf.setCreator("");
      newPdf.setProducer("");
      const newBytes = await newPdf.save();
      const blob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch {
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title={t("title")}
      description={t("description")}
    >
      <div className="space-y-6">
        <FileDropZone
          accept=".pdf,application/pdf"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => { setFiles([]); setPdfUrl(null); setSelectedPages([]); setPageOrder([]); }}
        />

        {pdfUrl && (
          <PdfPageGrid
            pdfUrl={pdfUrl}
            selectedPages={selectedPages}
            pageOrder={pageOrder}
            onSelectionChange={setSelectedPages}
            onOrderChange={setPageOrder}
            mode="both"
          />
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={splitPdf}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? t("processing") : t("action")}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="pdf"
            fileName="extracted.pdf"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
