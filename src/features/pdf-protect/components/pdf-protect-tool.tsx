"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Info, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";

export function PdfProtectTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
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

  const protectPdf = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner un fichier PDF.");
      return;
    }

    if (!password.trim()) {
      setError("Veuillez entrer un mot de passe.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });

      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText("PROTEGE", {
          x: width / 2 - 50,
          y: height / 2,
          size: 40,
          font,
          color: rgb(0.8, 0.8, 0.8),
          rotate: degrees(45),
          opacity: 0.3,
        });
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
      setError("Erreur lors du traitement du PDF.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Marquer un PDF"
      description="Ajoutez un filigrane visuel de protection à votre PDF."
    >
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Le chiffrement par mot de passe complet nécessite une bibliothèque serveur. 
            Cette version ajoute un marquage visuel de protection.
          </AlertDescription>
        </Alert>

        <FileDropZone
          accept=".pdf,application/pdf"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => setFiles([])}
        />

        {files.length > 0 && (
          <div>
            <Label htmlFor="password">Mot de passe (référence)</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez un mot de passe fort"
            />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={protectPdf}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          <Lock className="h-4 w-4 mr-2" />
          {processing ? "Traitement..." : "Protéger"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="pdf"
            fileName="protected.pdf"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
