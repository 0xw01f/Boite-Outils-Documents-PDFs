"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback, useEffect } from "react";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, Eraser } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  EMPTY_METADATA,
  detectKind,
  isBlockedMetadataFile,
  writeFileMetadata,
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

export function RemoveMetadataTool() {
  const t = useTranslations("tool.removeMetadata");
  const tCommon = useTranslations("common");
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState("cleaned.bin");

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  const handleFilesSelected = useCallback(
    (newFiles: File[]) => {
      const file = newFiles[0];
      if (!file) return;
      if (isBlockedMetadataFile(file) || !detectKind(file)) {
        setError(t("unsupportedError"));
        setFiles([]);
        return;
      }
      setFiles([file]);
      setError(null);
      setResultUrl(null);
    },
    [t]
  );

  const removeMetadata = async () => {
    if (files.length === 0) {
      setError(t("noFileError"));
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      const result = await writeFileMetadata(files[0], EMPTY_METADATA);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(result.blob));
      setResultName(result.fileName);
    } catch {
      setError(t("error"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div className="space-y-6">
        <FileDropZone
          accept={ACCEPT}
          onFilesSelected={handleFilesSelected}
          files={files}
          onRemoveFile={() => {
            setFiles([]);
            setResultUrl(null);
          }}
        />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={removeMetadata}
            disabled={files.length === 0 || processing}
            className="w-full sm:w-auto"
          >
            <Eraser className="h-4 w-4 mr-2" />
            {processing ? t("processing") : t("action")}
          </Button>

          {resultUrl && (
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a href={resultUrl} download={resultName}>
                <Download className="h-4 w-4 mr-2" />
                {tCommon("download")}
              </a>
            </Button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
