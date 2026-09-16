"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, Check, Copy, Link2, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TurnstileWidget } from "@/features/link-shield/components/turnstile-widget";
import { LinkShieldShell } from "@/features/link-shield/components/link-shield-shell";
import { DEFAULT_TTL_DAYS } from "@/features/link-shield/lib/constants";
import { normalizeTargetUrl, rewriteLocalShareUrl } from "@/features/link-shield/lib/url";

export function LinkShieldTool() {
  const t = useTranslations("tool.linkShield");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [url, setUrl] = useState("");
  const [ttlDays, setTtlDays] = useState(String(DEFAULT_TTL_DAYS));
  const [captchaReset, setCaptchaReset] = useState(0);
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

  const resetCaptcha = () => {
    setToken(null);
    setCaptchaReset((n) => n + 1);
  };

  const create = async () => {
    const normalized = normalizeTargetUrl(url);
    if (!normalized) {
      setError(url.trim() ? t("invalidUrl") : t("noUrlError"));
      return;
    }
    if (!token) {
      setError(t("captchaRequired"));
      return;
    }

    setUrl(normalized);
    setLoading(true);
    setError(null);
    setShareUrl(null);

    try {
      const res = await fetch("/api/link-shield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: normalized,
          ttlDays: Number(ttlDays),
          turnstileToken: token,
          locale,
        }),
      });
      const data = await res.json();
      resetCaptcha();
      if (!res.ok) {
        setError(data.error || t("apiError"));
        return;
      }
      setShareUrl(rewriteLocalShareUrl(data.shareUrl as string));
      setExpiresAt(typeof data.expiresAt === "number" ? data.expiresAt : null);
    } catch {
      resetCaptcha();
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
    <LinkShieldShell>
      <div className="space-y-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("kicker")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{t("description")}</p>
        </div>

        <div className="space-y-5 rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur">
          <div className="space-y-2">
            <Label htmlFor="target-url">{t("urlLabel")}</Label>
            <Input
              id="target-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t("urlPlaceholder")}
              className="h-11"
              onKeyDown={(e) => {
                if (e.key === "Enter") create();
              }}
            />
            <p className="text-xs text-muted-foreground">{t("urlHint")}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("ttlLabel")}</Label>
            <Select value={ttlDays} onValueChange={setTtlDays}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t("ttl1")}</SelectItem>
                <SelectItem value="7">{t("ttl7")}</SelectItem>
                <SelectItem value="30">{t("ttl30")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TurnstileWidget key={captchaReset} resetKey={captchaReset} onToken={setToken} />

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <Button onClick={create} disabled={loading} className="h-11 w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
            {loading ? t("processing") : t("action")}
          </Button>
        </div>

        {shareUrl && (
          <div className="space-y-3 rounded-2xl border bg-card p-6 shadow-sm">
            <Label>{t("resultLabel")}</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input readOnly value={shareUrl} className="h-11 font-mono text-xs sm:text-sm" />
              <Button variant="outline" onClick={copy} className="h-11 shrink-0">
                {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
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

        <p className="text-center text-xs leading-relaxed text-muted-foreground">{t("serverNotice")}</p>
      </div>
    </LinkShieldShell>
  );
}
