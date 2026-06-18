"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Loader2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface PdfPageGridProps {
  pdfUrl: string;
  selectedPages: number[];
  pageOrder: number[];
  onSelectionChange: (selected: number[]) => void;
  onOrderChange: (order: number[]) => void;
  mode?: "select" | "reorder" | "both";
  maxSelectable?: number;
}

interface PageThumbnail {
  index: number;
  url: string;
}

export function PdfPageGrid({
  pdfUrl,
  selectedPages,
  pageOrder,
  onSelectionChange,
  onOrderChange,
  mode = "both",
  maxSelectable,
}: PdfPageGridProps) {
  const t = useTranslations("pageGrid");
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderThumbnails() {
      setLoading(true);
      try {
        const pdfjsLib = await import("pdfjs-dist");
        if (typeof window !== "undefined") {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        const response = await fetch(pdfUrl);
        const bytes = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        if (pdf.numPages > 200) {
          throw new Error(t("tooManyPagesError", { max: 200 }));
        }
        const thumbs: PageThumbnail[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const scale = 0.5;
          const viewport = page.getViewport({ scale });
          const maxPixels = 4096 * 4096;
          if (viewport.width * viewport.height > maxPixels) {
            throw new Error(t("pageTooLarge", { page: i }));
          }
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport, canvas: canvas as unknown as HTMLCanvasElement }).promise;

          thumbs.push({ index: i - 1, url: canvas.toDataURL("image/png") });
        }

        if (!cancelled) {
          setThumbnails(thumbs);
        }
      } catch (err) {
        console.error("[PdfPageGrid] Failed to render thumbnails:", err);
        if (!cancelled) setThumbnails([]);
      }
      if (!cancelled) setLoading(false);
    }

    renderThumbnails();
    return () => { cancelled = true; };
  }, [pdfUrl, t]);

  const effectiveOrder = pageOrder.length > 0 ? pageOrder : thumbnails.map((t) => t.index);
  const orderedThumbnails = effectiveOrder
    .map((idx) => thumbnails.find((t) => t.index === idx))
    .filter(Boolean) as PageThumbnail[];

  const toggleSelection = useCallback(
    (pageIndex: number) => {
      if (mode === "reorder") return;
      const isSelected = selectedPages.includes(pageIndex);
      if (isSelected) {
        onSelectionChange(selectedPages.filter((p) => p !== pageIndex));
      } else {
        if (maxSelectable && selectedPages.length >= maxSelectable) return;
        onSelectionChange([...selectedPages, pageIndex]);
      }
    },
    [selectedPages, onSelectionChange, mode, maxSelectable]
  );

  const selectAll = useCallback(() => {
    if (mode === "reorder") return;
    onSelectionChange(pageOrder.length > 0 ? [...pageOrder] : thumbnails.map((t) => t.index));
  }, [pageOrder, thumbnails, onSelectionChange, mode]);

  const deselectAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const handleDragStart = (e: React.DragEvent, position: number) => {
    if (mode === "select") return;
    setDraggingIndex(position);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(position));
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    if (mode === "select" || draggingIndex === null || draggingIndex === position) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    if (mode === "select" || draggingIndex === null) return;
    e.preventDefault();

    const newOrder = [...pageOrder];
    const [draggedItem] = newOrder.splice(draggingIndex, 1);
    newOrder.splice(position, 0, draggedItem);

    onOrderChange(newOrder);
    setDraggingIndex(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">{t("loading")}</span>
      </div>
    );
  }

  if (thumbnails.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        {t("error")}
      </div>
    );
  }

  const showSelect = mode === "select" || mode === "both";
  const showReorder = mode === "reorder" || mode === "both";

  return (
    <div className="space-y-3">
      {showSelect && (
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {t("selectAll")}
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            {t("deselectAll")}
          </Button>
          <span className="text-xs text-muted-foreground">
            {t("selected", { count: selectedPages.length })}
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
      >
        {orderedThumbnails.map((thumb, position) => {
          const isSelected = selectedPages.includes(thumb.index);
          const isDragging = draggingIndex === position;

          return (
            <div
              key={thumb.index}
              draggable={showReorder}
              onDragStart={(e) => handleDragStart(e, position)}
              onDragOver={(e) => handleDragOver(e, position)}
              onDrop={(e) => handleDrop(e, position)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative group rounded-lg border overflow-hidden cursor-pointer transition-all",
                isSelected && "ring-2 ring-primary border-primary",
                isDragging && "opacity-50",
                !isSelected && "hover:border-muted-foreground/50"
              )}
              onClick={() => toggleSelection(thumb.index)}
            >
              <div className="absolute top-1 left-1 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                {thumb.index + 1}
              </div>

              {showReorder && (
                <div
                  className="absolute top-1 right-1 z-10 p-0.5 bg-black/60 text-white rounded cursor-grab active:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-3 w-3" />
                </div>
              )}

              {showSelect && (
                <div
                  className="absolute bottom-1 left-1 z-10 flex items-center justify-center w-5 h-5 rounded border bg-white/90"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(thumb.index)}
                    className="w-3.5 h-3.5 cursor-pointer accent-primary"
                  />
                </div>
              )}

              <img
                src={thumb.url}
                alt={t("pageAlt", { page: thumb.index + 1 })}
                className="w-full aspect-[3/4] object-cover"
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
