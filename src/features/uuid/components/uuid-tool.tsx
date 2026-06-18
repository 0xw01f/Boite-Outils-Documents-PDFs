"use client";

import { useTranslations } from "next-intl";

import { useState, useCallback } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Copy, Check, RefreshCw } from "lucide-react";

export function UuidTool() {
  const t = useTranslations("tool.uuid");
  const [count, setCount] = useState([5]);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateUuid = (): string => {
    return crypto.randomUUID();
  };

  const generateUuids = useCallback(() => {
    const newUuids = Array.from({ length: count[0] }, generateUuid);
    setUuids(newUuids);
  }, [count]);

  const copyToClipboard = async (uuid: string, index: number) => {
    await navigator.clipboard.writeText(uuid);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <ToolLayout
      title={t("title")}
      description={t("description")}
    >
      <div className="space-y-6">
        <div>
          <Label>{t("countLabel", { value: count[0] })}</Label>
          <Slider
            value={count}
            onValueChange={setCount}
            min={1}
            max={50}
            step={1}
          />
        </div>

        <Button onClick={generateUuids} className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("action")}
        </Button>

        {uuids.length > 0 && (
          <div className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md bg-muted"
              >
                <code className="text-sm font-mono flex-1">{uuid}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(uuid, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
