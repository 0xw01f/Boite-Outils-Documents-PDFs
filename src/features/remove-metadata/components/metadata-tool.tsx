"use client";

import { useTranslations, useLocale } from "next-intl";

import { useState, useCallback, useEffect } from "react";
import { cleanText } from "@/lib/sanitize";
import { PDFDocument } from "pdf-lib";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eraser, Save, Eye, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PreviewPanel } from "@/components/preview-panel";

interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
  creationDate?: string;
  modificationDate?: string;
}

const EMPTY_METADATA: PdfMetadata = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
};

export function MetadataTool() {
  const t = useTranslations("tool.metadataManager");
  const locale = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<PdfMetadata>(EMPTY_METADATA);
  const [originalMetadata, setOriginalMetadata] = useState<PdfMetadata>(EMPTY_METADATA);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("view");

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const extractMetadata = async (pdf: PDFDocument): Promise<PdfMetadata> => {
    const rawKeywords = pdf.getKeywords();
    let keywords = "";
    if (rawKeywords) {
      keywords = Array.isArray(rawKeywords) ? rawKeywords.join(", ") : String(rawKeywords);
    }

    return {
      title: pdf.getTitle() || "",
      author: pdf.getAuthor() || "",
      subject: pdf.getSubject() || "",
      keywords,
      creator: pdf.getCreator() || "",
      producer: pdf.getProducer() || "",
      creationDate: pdf.getCreationDate()?.toISOString?.() || "",
      modificationDate: pdf.getModificationDate()?.toISOString?.() || "",
    };
  };

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    const file = newFiles[0];
    if (!file) return;

    setFiles([file]);
    setError(null);
    setResultUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
      const meta = await extractMetadata(pdf);
      setMetadata(meta);
      setOriginalMetadata(meta);
      setActiveTab("view");
    } catch {
      setError(t("loadError"));
    }
  }, [t]);

  const updateMetadataField = (field: keyof PdfMetadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
    setResultUrl(null);
  };

  const applyMetadata = async () => {
    if (files.length === 0) {
      setError(t("noFileError"));
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const file = files[0];
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });

      pdf.setTitle(cleanText(metadata.title) || "");
      pdf.setAuthor(cleanText(metadata.author) || "");
      pdf.setSubject(cleanText(metadata.subject) || "");
      pdf.setKeywords(metadata.keywords ? cleanText(metadata.keywords).split(",").map((k) => k.trim()) : []);
      pdf.setCreator(cleanText(metadata.creator) || "");
      pdf.setProducer(cleanText(metadata.producer) || "");
      pdf.setModificationDate(new Date());
      const newBytes = await pdf.save();
      const blob = new Blob([newBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setOriginalMetadata(metadata);
    } catch {
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  };

  const clearAllMetadata = () => {
    setMetadata(EMPTY_METADATA);
    setResultUrl(null);
  };

  const hasChanges = JSON.stringify(metadata) !== JSON.stringify(originalMetadata);

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
          onRemoveFile={() => { setFiles([]); setMetadata(EMPTY_METADATA); setOriginalMetadata(EMPTY_METADATA); setResultUrl(null); }}
        />

        {files.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="view">
                <Eye className="h-4 w-4 mr-2" />
                {t("viewTab")}
              </TabsTrigger>
              <TabsTrigger value="edit">
                <Save className="h-4 w-4 mr-2" />
                {t("editTab")}
                {hasChanges && (
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">{t("modified")}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetadataField label={t("titleLabel")} value={metadata.title || t("empty")} />
                <MetadataField label={t("authorLabel")} value={metadata.author || t("empty")} />
                <MetadataField label={t("subjectLabel")} value={metadata.subject || t("empty")} />
                <MetadataField label={t("keywordsLabel")} value={metadata.keywords || t("empty")} />
                <MetadataField label={t("creatorLabel")} value={metadata.creator || t("empty")} />
                <MetadataField label={t("producerLabel")} value={metadata.producer || t("empty")} />
              </div>
              {(metadata.creationDate || metadata.modificationDate) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {metadata.creationDate && (
                    <MetadataField label={t("creationDateLabel")} value={new Date(metadata.creationDate).toLocaleString(locale)} />
                  )}
                  {metadata.modificationDate && (
                    <MetadataField label={t("modificationDateLabel")} value={new Date(metadata.modificationDate).toLocaleString(locale)} />
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="edit" className="space-y-4 mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t("editHint")} {t("emptyHint")}
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="title">{t("titleLabel")}</Label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) => updateMetadataField("title", e.target.value)}
                    placeholder={t("titlePlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="author">{t("authorLabel")}</Label>
                  <Input
                    id="author"
                    value={metadata.author}
                    onChange={(e) => updateMetadataField("author", e.target.value)}
                    placeholder={t("authorPlaceholder")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="subject">{t("subjectLabel")}</Label>
                  <Input
                    id="subject"
                    value={metadata.subject}
                    onChange={(e) => updateMetadataField("subject", e.target.value)}
                    placeholder={t("subjectPlaceholder")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="keywords">{t("keywordsLabel")}</Label>
                  <Input
                    id="keywords"
                    value={metadata.keywords}
                    onChange={(e) => updateMetadataField("keywords", e.target.value)}
                    placeholder={t("keywordsPlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="creator">{t("creatorLabel")}</Label>
                  <Input
                    id="creator"
                    value={metadata.creator}
                    onChange={(e) => updateMetadataField("creator", e.target.value)}
                    placeholder={t("creatorPlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="producer">{t("producerLabel")}</Label>
                  <Input
                    id="producer"
                    value={metadata.producer}
                    onChange={(e) => updateMetadataField("producer", e.target.value)}
                    placeholder={t("producerPlaceholder")}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={applyMetadata}
                  disabled={processing}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? t("processing") : t("action")}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAllMetadata}
                  className="w-full sm:w-auto"
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  {t("clear")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resultUrl && (
          <PreviewPanel
            url={resultUrl}
            type="pdf"
            fileName={files[0]?.name || "metadata.pdf"}
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  );
}
