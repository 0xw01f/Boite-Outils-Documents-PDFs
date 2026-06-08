"use client";

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
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [compact, setCompact] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("text");

  const formatJson = useCallback((source: string) => {
    if (!source.trim()) {
      setError("Veuillez entrer ou importer du JSON.");
      return;
    }

    try {
      const parsed = JSON.parse(source);
      const formatted = compact ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
    } catch (err) {
      setError("JSON invalide. Vérifiez la syntaxe.");
      setOutput("");
    }
  }, [compact]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setInput(text);
      setError(null);
    } catch {
      setError("Impossible de lire le fichier.");
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Formatez et validez du JSON."
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="text">
              <Type className="h-3.5 w-3.5 mr-1.5" />
              Texte
            </TabsTrigger>
            <TabsTrigger value="file">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Fichier
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="json-input">JSON</Label>
              <Textarea
                id="json-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"exemple": "valeur", "nombre": 123}'
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-4">
            <div>
              <Label>Fichier JSON</Label>
              <Input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              {input && (
                <p className="text-xs text-muted-foreground mt-1">
                  Fichier importé. Cliquez sur Formater pour valider.
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
          <Label htmlFor="compact">Format compact</Label>
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
            Formater
          </Button>

          {output && (
            <Button variant="outline" onClick={copyToClipboard} className="w-full sm:w-auto">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copié !" : "Copier"}
            </Button>
          )}
        </div>

        {output && (
          <div className="space-y-2">
            <Label>Résultat :</Label>
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
