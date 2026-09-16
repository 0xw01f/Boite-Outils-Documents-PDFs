"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useCallback, useEffect } from "react";
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
import {
  EMPTY_METADATA,
  METADATA_FIELD_MAX,
  detectKind,
  isBlockedMetadataFile,
  readFileMetadata,
  writeFileMetadata,
  type FileMetadata,
  type MetadataKind,
} from "@/features/remove-metadata/lib/file-metadata";

const ACCEPT = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
  ".docx",
  ".xlsx",
  ".pptx",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

type PreviewType = "pdf" | "image" | "file";

export function MetadataTool() {
  const t = useTranslations("tool.metadataManager");
  const locale = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [kind, setKind] = useState<MetadataKind | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata>(EMPTY_METADATA);
  const [originalMetadata, setOriginalMetadata] = useState<FileMetadata>(EMPTY_METADATA);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("metadata.bin");
  const [resultType, setResultType] = useState<PreviewType>("pdf");
  const [activeTab, setActiveTab] = useState("view");

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const reset = () => {
    setFiles([]);
    setKind(null);
    setMetadata(EMPTY_METADATA);
    setOriginalMetadata(EMPTY_METADATA);
    setResultUrl(null);
    setError(null);
  };

  const handleFilesSelected = useCallback(
    async (newFiles: File[]) => {
      const file = newFiles[0];
      if (!file) return;

      if (isBlockedMetadataFile(file) || !detectKind(file)) {
        setError(t("unsupportedError"));
        setFiles([]);
        setKind(null);
        return;
      }

      setFiles([file]);
      setError(null);
      setResultUrl(null);

      try {
        const { kind: detected, metadata: meta } = await readFileMetadata(file);
        setKind(detected);
        setMetadata(meta);
        setOriginalMetadata(meta);
        setActiveTab("view");
      } catch {
        setError(t("loadError"));
      }
    },
    [t]
  );

  const updateMetadataField = (field: keyof FileMetadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value.slice(0, METADATA_FIELD_MAX) }));
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

      const result = await writeFileMetadata(files[0], metadata);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(result.blob));
      setResultName(result.fileName);
      setResultType(result.previewType);
      setOriginalMetadata({ ...metadata, creationDate: "", modificationDate: "", gps: "" });
    } catch {
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  };

  const clearAllMetadata = () => {
    setMetadata({ ...EMPTY_METADATA, gps: metadata.gps, creationDate: metadata.creationDate, modificationDate: metadata.modificationDate });
    setResultUrl(null);
  };

  const hasChanges = JSON.stringify({ ...metadata, gps: "", creationDate: "", modificationDate: "" }) !==
    JSON.stringify({ ...originalMetadata, gps: "", creationDate: "", modificationDate: "" });
  const convertsToJpeg = kind === "heic" || kind === "webp" || kind === "gif";
  const showProducer = kind === "pdf";

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div className="space-y-6">
        <FileDropZone
          accept={ACCEPT}
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={reset}
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
                  <Badge variant="secondary" className="ml-2 text-[10px] px-1.5">
                    {t("modified")}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-4 mt-4">
              {kind && (
                <p className="text-xs text-muted-foreground">{t("kindLabel", { kind: t(`kinds.${kind}`) })}</p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <MetadataField label={t("titleLabel")} value={metadata.title || t("empty")} />
                <MetadataField label={t("authorLabel")} value={metadata.author || t("empty")} />
                <MetadataField label={t("subjectLabel")} value={metadata.subject || t("empty")} />
                <MetadataField label={t("keywordsLabel")} value={metadata.keywords || t("empty")} />
                <MetadataField label={t("creatorLabel")} value={metadata.creator || t("empty")} />
                {showProducer && (
                  <MetadataField label={t("producerLabel")} value={metadata.producer || t("empty")} />
                )}
                <MetadataField label={t("copyrightLabel")} value={metadata.copyright || t("empty")} />
              </div>
              {(metadata.creationDate || metadata.modificationDate || metadata.gps) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {metadata.creationDate && (
                    <MetadataField
                      label={t("creationDateLabel")}
                      value={formatDate(metadata.creationDate, locale)}
                    />
                  )}
                  {metadata.modificationDate && (
                    <MetadataField
                      label={t("modificationDateLabel")}
                      value={formatDate(metadata.modificationDate, locale)}
                    />
                  )}
                  {metadata.gps && <MetadataField label={t("gpsLabel")} value={metadata.gps} />}
                </div>
              )}
            </TabsContent>

            <TabsContent value="edit" className="space-y-4 mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t("editHint")} {t("emptyHint")} {t("localHint")} {t("gpsHint")}
                  {convertsToJpeg ? ` ${t("rasterHint")}` : ""}
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2">
                <MetaInput id="title" label={t("titleLabel")} value={metadata.title} placeholder={t("titlePlaceholder")} onChange={(v) => updateMetadataField("title", v)} />
                <MetaInput id="author" label={t("authorLabel")} value={metadata.author} placeholder={t("authorPlaceholder")} onChange={(v) => updateMetadataField("author", v)} />
                <MetaInput id="subject" label={t("subjectLabel")} value={metadata.subject} placeholder={t("subjectPlaceholder")} onChange={(v) => updateMetadataField("subject", v)} className="sm:col-span-2" />
                <MetaInput id="keywords" label={t("keywordsLabel")} value={metadata.keywords} placeholder={t("keywordsPlaceholder")} onChange={(v) => updateMetadataField("keywords", v)} className="sm:col-span-2" />
                <MetaInput id="creator" label={t("creatorLabel")} value={metadata.creator} placeholder={t("creatorPlaceholder")} onChange={(v) => updateMetadataField("creator", v)} />
                {showProducer && (
                  <MetaInput id="producer" label={t("producerLabel")} value={metadata.producer} placeholder={t("producerPlaceholder")} onChange={(v) => updateMetadataField("producer", v)} />
                )}
                <MetaInput id="copyright" label={t("copyrightLabel")} value={metadata.copyright} placeholder={t("copyrightPlaceholder")} onChange={(v) => updateMetadataField("copyright", v)} className={showProducer ? "sm:col-span-2" : undefined} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={applyMetadata} disabled={processing} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? t("processing") : t("action")}
                </Button>
                <Button variant="outline" onClick={clearAllMetadata} className="w-full sm:w-auto">
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
            type={resultType}
            fileName={resultName}
            onClose={() => setResultUrl(null)}
          />
        )}
      </div>
    </ToolLayout>
  );
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale);
}

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-md bg-muted/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  );
}

function MetaInput({
  id,
  label,
  value,
  placeholder,
  onChange,
  className,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        maxLength={METADATA_FIELD_MAX}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
