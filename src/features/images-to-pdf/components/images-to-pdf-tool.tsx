"use client";

import { useState, useCallback, useEffect } from "react";
import { jsPDF } from "jspdf";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ImagesToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [fitToPage, setFitToPage] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const imageFiles = newFiles.filter((f) =>
      f.type.startsWith("image/") ||
      f.name.match(/\.(jpg|jpeg|png|webp|gif|bmp)$/i)
    );
    setFiles(imageFiles);
    setError(null);
    setResultUrl(null);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResultUrl(null);
  }, []);

  const moveFile = useCallback((index: number, direction: "up" | "down") => {
    setFiles((prev) => {
      const newFiles = [...prev];
      if (direction === "up" && index > 0) {
        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
      } else if (direction === "down" && index < newFiles.length - 1) {
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      }
      return newFiles;
    });
    setResultUrl(null);
  }, []);

  const convertImageToSupportedFormat = async (file: File): Promise<{ dataUrl: string; format: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const originalDataUrl = e.target?.result as string;
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Impossible d'obtenir le contexte canvas"));
            return;
          }

          // Fill white background for non-transparent formats
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          // Convert to JPEG for best compatibility with jsPDF
          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          resolve({ dataUrl, format: "JPEG" });
        };

        img.onerror = () => reject(new Error(`Impossible de charger l'image ${file.name}`));
        img.src = originalDataUrl;
      };
      reader.onerror = () => reject(new Error(`Impossible de lire ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      setError("Veuillez sélectionner au moins une image.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < files.length; i++) {
        if (i > 0) pdf.addPage();

        const file = files[i];
        const { dataUrl } = await convertImageToSupportedFormat(file);

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Impossible de charger ${file.name}`));
          img.src = dataUrl;
        });

        if (img.width === 0 || img.height === 0) {
          throw new Error(`Image invalide : ${file.name} (dimensions nulles)`);
        }

        let width = img.width;
        let height = img.height;

        if (fitToPage) {
          const ratio = Math.min(pageWidth / width, pageHeight / height);
          width *= ratio;
          height *= ratio;
        }

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        pdf.addImage(dataUrl, "JPEG", x, y, width, height);
      }

      pdf.setProperties({ title: "", subject: "", author: "", keywords: "", creator: "" });
      // Strip jsPDF metadata via internal API
      const internal = pdf.internal as any;
      if (internal?.getPDFDocument?.().info) {
        const info = internal.getPDFDocument().info;
        info.Title = "";
        info.Subject = "";
        info.Author = "";
        info.Keywords = "";
        info.Creator = "";
        info.Producer = "";
      }

      const blob = pdf.output("blob");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err: any) {
      console.error(err);
      setError(`Erreur lors de la conversion: ${err?.message || "Vérifiez le format des images."}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Images → PDF"
      description="Combinez plusieurs images en un seul fichier PDF."
    >
      <div className="space-y-6">
        <FileDropZone
          accept="image/*"
          multiple
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={handleRemoveFile}
        />

        {files.length > 0 && (
          <>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Switch
                id="fit-to-page"
                checked={fitToPage}
                onCheckedChange={setFitToPage}
              />
              <Label htmlFor="fit-to-page" className="cursor-pointer">
                Adapter les images à la page A4
              </Label>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Ordre des images :</p>
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 rounded-md bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveFile(index, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveFile(index, "down")}
                      disabled={index === files.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={convertToPdf}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? "Conversion..." : "Convertir en PDF"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="pdf"
            fileName="images.pdf"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
