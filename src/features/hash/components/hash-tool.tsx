"use client";

import { useTranslations } from "next-intl";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Hash, Info, FileText, Type } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cleanText } from "@/lib/sanitize";

type HashAlgo = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

const ALGORITHMS: HashAlgo[] = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512"];

async function computeHashText(text: string, algo: HashAlgo, t: ReturnType<typeof useTranslations>): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const algoName = algo.replace("SHA-", "SHA-").replace("SHA-1", "SHA-1").replace("MD5", "MD5");

  if (algo === "MD5") {
    return t("md5Unavailable");
  }

  const hashBuffer = await crypto.subtle.digest(algoName as AlgorithmIdentifier, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function computeHashFile(buffer: ArrayBuffer, algo: HashAlgo, t: ReturnType<typeof useTranslations>): Promise<string> {
  const algoName = algo.replace("SHA-", "SHA-").replace("SHA-1", "SHA-1").replace("MD5", "MD5");

  if (algo === "MD5") {
    return t("md5Unavailable");
  }

  const hashBuffer = await crypto.subtle.digest(algoName as AlgorithmIdentifier, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function HashTool() {
  const t = useTranslations("tool.hash");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("text");

  const computeAllText = useCallback(async () => {
    const clean = cleanText(text);
    if (!clean.trim()) {
      setResults({});
      return;
    }

    const newResults: Record<string, string> = {};
    for (const algo of ALGORITHMS) {
      try {
        newResults[algo] = await computeHashText(clean, algo, t);
      } catch {
        newResults[algo] = t("errorResult");
      }
    }
    setResults(newResults);
  }, [text, t]);

  const computeAllFile = useCallback(async () => {
    if (!file) {
      setResults({});
      return;
    }

    const buffer = await file.arrayBuffer();
    const newResults: Record<string, string> = {};
    for (const algo of ALGORITHMS) {
      try {
        newResults[algo] = await computeHashFile(buffer, algo, t);
      } catch {
        newResults[algo] = t("errorResult");
      }
    }
    setResults(newResults);
  }, [file, t]);

  const copyToClipboard = async (value: string, algo: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(algo);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolLayout
      title={t("title")}
      description={t("description")}
    >
      <div className="space-y-6">
        <Alert variant="default" className="bg-muted/50 border-muted">
          <Info className="h-4 w-4 mt-0.5" />
          <AlertDescription className="text-sm">
            {t("info")}
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="text">
              <Type className="h-3.5 w-3.5 mr-1.5" />
              {t("textTab")}
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              {t("fileTab")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="text-input">{t("textLabel")}</Label>
              <Textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("textPlaceholder")}
                rows={4}
              />
            </div>
            <Button
              onClick={computeAllText}
              disabled={!text.trim()}
              className="w-full sm:w-auto"
            >
              <Hash className="h-4 w-4 mr-2" />
              {t("action")}
            </Button>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-4">
            <div>
              <Label>{t("fileLabel")}</Label>
              <Input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {file && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("fileInfo", { name: file.name, size: (file.size / 1024).toFixed(1) })}
                </p>
              )}
            </div>
            <Button
              onClick={computeAllFile}
              disabled={!file}
              className="w-full sm:w-auto"
            >
              <Hash className="h-4 w-4 mr-2" />
              {t("action")}
            </Button>
          </TabsContent>
        </Tabs>

        {Object.keys(results).length > 0 && (
          <div className="space-y-3">
            {ALGORITHMS.map((algo) => (
              <div key={algo} className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground">{algo}</Label>
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                  <code className="text-sm font-mono break-all flex-1">{results[algo]}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => copyToClipboard(results[algo], algo)}
                  >
                    {copied === algo ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
