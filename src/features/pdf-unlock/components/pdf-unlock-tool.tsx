"use client";

import { useState, useCallback } from "react";
import { FileDropZone } from "@/components/file-drop-zone";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function PdfUnlockTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1));
  }, []);

  return (
    <ToolLayout
      title="Déverrouiller un PDF"
      description="Retirez le mot de passe d'un PDF."
    >
      <div className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Le déverrouillage de PDF nécessite des bibliothèques de chiffrement qui ne sont pas 
            disponibles en navigateur pur. Cette fonctionnalité sera disponible dans une version 
            avec backend léger.
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
            <Label htmlFor="password">Mot de passe actuel</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez le mot de passe actuel"
              disabled
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
