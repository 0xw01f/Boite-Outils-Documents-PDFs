"use client";

import { useTranslations } from "next-intl";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Braces, AlertCircle, Type, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function JsonFormatterTool() {
  const t = useTranslations("tool.jsonFormatter");
  const tCommon = useTranslations("common");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [compact, setCompact] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("text");

  const formatJson = useCallback((source: string) => {
    if (!source.trim()) {
      setError(t("noInputError"));
      return;
    }

    try {
      const parsed = JSON.parse(source);
      const formatted = compact ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
    } catch {
      setError(t("invalidError"));
      setOutput("");
    }
  }, [compact, t]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setInput(text);
      setError(null);
    } catch {
      setError(t("readError"));
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title={t("title")}
      description={t("description")}
    >
      <div className="space-y-6">
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
              <Label htmlFor="json-input">{t("jsonLabel")}</Label>
              <Textarea
                id="json-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("jsonPlaceholder")}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-4">
            <div>
              <Label>{t("fileLabel")}</Label>
              <Input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              {input && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t("fileImported")}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-3">
          <Switch
            id="compact"
            checked={compact}
            onCheckedChange={setCompact}
          />
          <Label htmlFor="compact">{t("compact")}</Label>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => formatJson(input)} className="w-full sm:w-auto">
            <Braces className="h-4 w-4 mr-2" />
            {t("action")}
          </Button>

          {output && (
            <Button variant="outline" onClick={copyToClipboard} className="w-full sm:w-auto">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? tCommon("copied") : tCommon("copy")}
            </Button>
          )}
        </div>

        {output && (
          <div className="space-y-2">
            <Label>{t("resultLabel")}</Label>
            <Textarea
              value={output}
              readOnly
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
