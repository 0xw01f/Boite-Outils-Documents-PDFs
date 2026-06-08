"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X } from "lucide-react";

interface FileDropZoneProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  files: File[];
  onRemoveFile?: (index: number) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  onError?: (message: string) => void;
}

export function FileDropZone({
  accept = "*",
  multiple = false,
  onFilesSelected,
  files,
  onRemoveFile,
  maxFiles,
  maxSizeMB = 100,
  onError,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter((f) => {
        if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
          onError?.(`Fichier trop volumineux : ${f.name} (max ${maxSizeMB} MB)`);
          return false;
        }
        if (accept === "*") return true;
        return accept.split(",").some((type) => {
          const trimmed = type.trim();
          if (trimmed.endsWith("/*")) {
            return f.type.startsWith(trimmed.replace("/*", ""));
          }
          return f.type === trimmed || f.name.endsWith(trimmed.replace("*", ""));
        });
      });
      
      if (maxFiles && files.length + validFiles.length > maxFiles) {
        onFilesSelected([...files, ...validFiles].slice(0, maxFiles));
      } else {
        onFilesSelected(multiple ? [...files, ...validFiles] : validFiles.slice(0, 1));
      }
    },
    [accept, multiple, onFilesSelected, files, maxFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      const validFiles = selectedFiles.filter((f) => {
        if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
          onError?.(`Fichier trop volumineux : ${f.name} (max ${maxSizeMB} MB)`);
          return false;
        }
        return true;
      });
      if (maxFiles && files.length + validFiles.length > maxFiles) {
        onFilesSelected([...files, ...validFiles].slice(0, maxFiles));
      } else {
        onFilesSelected(multiple ? [...files, ...validFiles] : validFiles.slice(0, 1));
      }
    },
    [multiple, onFilesSelected, files, maxFiles]
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">
          Glissez-déposez vos fichiers ici
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ou cliquez pour sélectionner
        </p>
        <input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 rounded-md bg-muted"
            >
              <div className="flex items-center gap-2 min-w-0">
                <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              {onRemoveFile && (
                <button
                  onClick={() => onRemoveFile(index)}
                  className="p-1 hover:bg-destructive/10 rounded-md flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5 text-destructive" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
