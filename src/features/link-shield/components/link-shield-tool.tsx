"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, Check, Copy, Link2, Loader2, Shield } from "lucide-react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TurnstileWidget } from "@/features/link-shield/components/turnstile-widget";
import { DEFAULT_TTL_DAYS } from "@/features/link-shield/lib/constants";

export function LinkShieldTool() {
  const t = useTranslations("tool.linkShield");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [url, setUrl] = useState("");
  const [ttlDays, setTtlDays] = useState(String(DEFAULT_TTL_DAYS));
  const [token, setToken] = useState<string | null>(
    process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      ? "dev-bypass"
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const create = async () => {
    if (!url.trim()) {
      setError(t("noUrlError"));
      return;
    }
    if (!token) {
      setError(t("captchaRequired"));
      return;
    }

    setLoading(true);
    setError(null);
    setShareUrl(null);

    try {
      const res = await fetch("/api/link-shield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          ttlDays: Number(ttlDays),
          turnstileToken: token,
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("apiError"));
        return;
      }
      setShareUrl(data.shareUrl as string);
      setExpiresAt(typeof data.expiresAt === "number" ? data.expiresAt : null);
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError(t("copyError"));
    }
  };

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>{t("serverNotice")}</AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="target-url">{t("urlLabel")}</Label>
          <Input
            id="target-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("urlPlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") create();
            }}
          />
          <p className="text-xs text-muted-foreground">{t("urlHint")}</p>
        </div>

        <div className="space-y-2">
          <Label>{t("ttlLabel")}</Label>
          <Select value={ttlDays} onValueChange={setTtlDays}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t("ttl1")}</SelectItem>
              <SelectItem value="7">{t("ttl7")}</SelectItem>
              <SelectItem value="30">{t("ttl30")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TurnstileWidget onToken={setToken} />

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={create} disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />}
          {loading ? t("processing") : t("action")}
        </Button>

        {shareUrl && (
          <div className="space-y-2 rounded-lg border p-4">
            <Label>{t("resultLabel")}</Label>
            <div className="flex gap-2">
              <Input readOnly value={shareUrl} className="font-mono text-xs sm:text-sm" />
              <Button variant="outline" onClick={copy} className="shrink-0">
                {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                {copied ? tCommon("copied") : tCommon("copy")}
              </Button>
            </div>
            {expiresAt && (
              <p className="text-xs text-muted-foreground">
                {t("expiresAt", {
                  date: new Date(expiresAt).toLocaleString(locale === "fr" ? "fr-FR" : "en-US"),
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
