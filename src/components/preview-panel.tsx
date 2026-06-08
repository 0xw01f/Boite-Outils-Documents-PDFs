"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ImageIcon, Eye, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewPanelProps {
  url: string | null;
  type: "pdf" | "image" | "images";
  fileName?: string;
  onClose?: () => void;
  imageUrls?: string[];
}

export function PreviewPanel({ url, type, fileName = "download", onClose, imageUrls = [] }: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState("preview");
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (type !== "pdf" || !url) return;
      setLoading(true);
      try {
        const pdfjsLib = await import("pdfjs-dist");
        if (typeof window !== "undefined") {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        const response = await fetch(url);
        const bytes = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (pdf.numPages > 200) {
          throw new Error("PDF trop volumineux (max 200 pages pour l'aperçu)");
        }
        const pages: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const scale = 1.5;
          const viewport = page.getViewport({ scale });
          const maxPixels = 4096 * 4096;
          if (viewport.width * viewport.height > maxPixels) {
            throw new Error(`Dimensions de page trop grandes (page ${i})`);
          }
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport, canvas: canvas as unknown as HTMLCanvasElement }).promise;
          pages.push(canvas.toDataURL("image/png"));
        }

        if (!cancelled) {
          setPdfPages(pages);
          setCurrentPage(0);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[PreviewPanel] Failed to render PDF:", err);
        }
      }
      if (!cancelled) setLoading(false);
    }

    render();
    return () => { cancelled = true; };
  }, [url, type]);

  if (!url) return null;

  const isPdf = type === "pdf";
  const isImages = type === "images";

  const getFileName = (extension: string) => {
    const base = fileName.replace(/\.(pdf|png|jpg|jpeg|webp|zip)$/i, "");
    return `${base}.${extension}`;
  };

  const triggerDownload = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = getFileName(isPdf ? "pdf" : isImages ? "zip" : "png");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPdf ? <FileText className="h-4 w-4 text-primary" /> : <ImageIcon className="h-4 w-4 text-primary" />}
            <CardTitle className="text-base">Aperçu avant téléchargement</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={triggerDownload}>
              <Download className="h-3.5 w-3.5 mr-1" />
              Télécharger
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-3">
            <TabsTrigger value="preview">
              <Eye className="h-3.5 w-3.5 mr-1" />
              Aperçu
            </TabsTrigger>
            {isImages && imageUrls.length > 0 && (
              <TabsTrigger value="gallery">
                <ImageIcon className="h-3.5 w-3.5 mr-1" />
                Images ({imageUrls.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="preview" className="mt-0">
            {isPdf && (
              <div className="space-y-3" ref={containerRef}>
                {loading && (
                  <div className="flex items-center justify-center h-[400px] rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">Chargement de l&apos;aperçu...</p>
                  </div>
                )}
                {!loading && pdfPages.length > 0 && (
                  <>
                    <div className="rounded-lg border overflow-hidden bg-muted/30 flex items-center justify-center p-4 min-h-[400px]">
                      <img
                        src={pdfPages[currentPage]}
                        alt={`Page ${currentPage + 1}`}
                        className="max-w-full max-h-[500px] object-contain rounded-md shadow-sm"
                      />
                    </div>
                    {pdfPages.length > 1 && (
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                          disabled={currentPage === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage + 1} / {pdfPages.length}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(pdfPages.length - 1, p + 1))}
                          disabled={currentPage === pdfPages.length - 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
                {!loading && pdfPages.length === 0 && (
                  <div className="rounded-lg border bg-muted/30 p-8 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      L&apos;aperçu du PDF n&apos;a pas pu être généré.
                    </p>
                    <Button variant="outline" size="sm" onClick={triggerDownload}>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Télécharger pour visualiser
                    </Button>
                  </div>
                )}
              </div>
            )}
            {!isPdf && !isImages && (
              <div className="rounded-lg border overflow-hidden bg-muted/30 flex items-center justify-center p-4">
                <img
                  src={url}
                  alt="Aperçu"
                  className="max-w-full max-h-[500px] object-contain rounded-md"
                />
              </div>
            )}
            {isImages && (
              <div className="rounded-lg border bg-muted/30 p-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  {imageUrls.length} image(s) générée(s). Les images sont compressées dans un fichier ZIP.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {imageUrls.slice(0, 4).map((imgUrl, i) => (
                    <div key={i} className="relative aspect-square rounded-md overflow-hidden border">
                      <img src={imgUrl} alt={`Page ${i + 1}`} className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {isImages && imageUrls.length > 0 && (
            <TabsContent value="gallery" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
                {imageUrls.map((imgUrl, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-md overflow-hidden border">
                    <img src={imgUrl} alt={`Page ${i + 1}`} className="object-contain w-full h-full bg-muted/30" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center">
                      Page {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
