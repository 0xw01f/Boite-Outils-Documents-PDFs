"use client";

import { useState, useCallback, useEffect } from "react";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Type } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PreviewPanel } from "@/components/preview-panel";
import { cleanText } from "@/lib/sanitize";

const ID_COLORS = [
  { r: 0.0, g: 0.27, b: 0.58 },   // French blue
  { r: 0.95, g: 0.95, b: 0.95 },  // Off-white
  { r: 0.87, g: 0.14, b: 0.14 },  // French red
];

function getLineColor(lineIndex: number, useColors: boolean) {
  if (!useColors) return rgb(0.55, 0.55, 0.55);
  const colorIndex = lineIndex % ID_COLORS.length;
  const c = ID_COLORS[colorIndex];
  return rgb(c.r, c.g, c.b);
}

export function WatermarkPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("Document confidentiel");
  const [opacity, setOpacity] = useState([25]);
  const [density, setDensity] = useState([50]);
  const [fontSize, setFontSize] = useState([22]);
  const [useBwrColors, setUseBwrColors] = useState(true);
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

  const addTextWatermark = async () => {
    if (files.length === 0) {
      setError("Veuillez selectionner un fichier PDF.");
      return;
    }

    const clean = cleanText(text).trim();
    if (!clean) {
      setError("Veuillez entrer un texte de filigrane.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);

      const alpha = opacity[0] / 100;
      const baseFontSize = fontSize[0];
      const spacingCoeff = density[0] / 100;

      pages.forEach((page) => {
        const { width, height } = page.getSize();

        // Diagonal angle: -30 degrees
        const angleRad = -30 * (Math.PI / 180);
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);

        // Cover entire page plus margin
        const diagonal = Math.sqrt(width * width + height * height);

        const rowSpacing = baseFontSize * 2.2 * (1.5 - spacingCoeff * 0.7);
        const colSpacing = baseFontSize * clean.length * 0.55 * (1.5 - spacingCoeff * 0.7);

        if (rowSpacing <= 0 || colSpacing <= 0) {
          throw new Error("Paramètres de filigrane invalides.");
        }

        const startX = -diagonal * 0.25;
        const endX = width + diagonal * 0.25;
        const startY = -diagonal * 0.25;
        const endY = height + diagonal * 0.25;

        let row = 0;
        for (let y = startY; y < endY; y += rowSpacing) {
          // Alternate starting offset every other row for brick pattern
          const xOffset = (row % 2) * (colSpacing / 2);

          // Each row gets ONE color (alternating BWR)
          const lineColor = getLineColor(row, useBwrColors);

          for (let x = startX; x < endX; x += colSpacing) {
            // Smooth wave: sine based on position along the diagonal axis
            const diagonalPos = (x * cos) + (y * sin);
            const waveFrequency = 0.012;
            const waveAmplitude = baseFontSize * 0.35;
            const waveOffset = Math.sin(diagonalPos * waveFrequency) * waveAmplitude;

            // Slight jitter to resist AI removal
            const jitterX = Math.sin(row * 7.3 + x * 0.003) * baseFontSize * 0.15;
            const jitterY = Math.cos(row * 5.1 + x * 0.002) * baseFontSize * 0.15;

            const drawX = x + xOffset + jitterX;
            const drawY = y + waveOffset + jitterY;

            // Measure text width
            const textWidth = font.widthOfTextAtSize(clean, baseFontSize);

            page.drawText(clean, {
              x: drawX,
              y: drawY,
              size: baseFontSize,
              font,
              color: lineColor,
              rotate: degrees(-30),
              opacity: alpha,
            });
          }

          row++;
        }
      });

      // Strip pdf-lib auto metadata
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
      setError("Erreur lors de l'ajout du filigrane.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="Filigrane PDF"
      description="Ajoutez un filigrane style document d'identite resistant aux modifications IA."
      
    >
      <div className="space-y-6">
        <FileDropZone
          accept=".pdf,application/pdf"
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => setFiles([])}
        />

        {files.length > 0 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="watermark-text" className="flex items-center gap-2">
                <Type className="h-3.5 w-3.5" />
                Texte du filigrane
              </Label>
              <Input
                id="watermark-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Document confidentiel"
                maxLength={200}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Taille du texte ({fontSize[0]}px)</Label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  min={10}
                  max={60}
                  step={2}
                />
              </div>

              <div>
                <Label>Densite ({density[0]}%)</Label>
                <Slider
                  value={density}
                  onValueChange={setDensity}
                  min={20}
                  max={100}
                  step={5}
                />
              </div>
            </div>

            <div>
              <Label>Opacite ({opacity[0]}%)</Label>
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                max={80}
                step={2}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="bwr-colors" className="cursor-pointer">
                  Couleurs Bleu/Blanc/Rouge par ligne
                </Label>
                <p className="text-xs text-muted-foreground">
                  Chaque ligne alterne entre les 3 couleurs
                </p>
              </div>
              <Switch
                id="bwr-colors"
                checked={useBwrColors}
                onCheckedChange={setUseBwrColors}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Le filigrane inclut une legere variation et un effet de vague sinusoidale
                pour résister à la suppression automatique.
              </span>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={addTextWatermark}
          disabled={files.length === 0 || processing}
          className="w-full sm:w-auto"
        >
          {processing ? "Application du filigrane..." : "Appliquer le filigrane"}
        </Button>

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="pdf"
            fileName="watermarked.pdf"
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}
