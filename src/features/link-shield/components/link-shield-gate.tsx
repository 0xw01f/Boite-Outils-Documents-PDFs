"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/features/link-shield/components/turnstile-widget";
import { LinkShieldShell } from "@/features/link-shield/components/link-shield-shell";

export function LinkShieldGate({ id }: { id: string }) {
  const t = useTranslations("tool.linkShieldGate");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [token, setToken] = useState<string | null>(
    process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      ? "dev-bypass"
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  const resetCaptcha = () => {
    setToken(null);
    setCaptchaReset((n) => n + 1);
  };

  const reveal = async () => {
    if (!token) {
      setError(t("captchaRequired"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/link-shield/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, turnstileToken: token }),
      });
      const data = await res.json();
      if (!res.ok) {
        resetCaptcha();
        setError(data.error || t("apiError"));
        return;
      }
      setTargetUrl(data.url as string);
    } catch {
      resetCaptcha();
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinkShieldShell>
      <div className="space-y-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("kicker")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{t("description")}</p>
        </div>

        <div className="rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur">
          {!targetUrl ? (
            <div className="space-y-5">
              <p className="text-center text-sm text-muted-foreground">{t("notice")}</p>
              <TurnstileWidget key={captchaReset} resetKey={captchaReset} onToken={setToken} />
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <Button onClick={reveal} disabled={loading} className="h-11 w-full text-sm">
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                {loading ? t("processing") : t("action")}
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {t("revealed")}
                </p>
                <p className="break-all rounded-xl bg-muted/70 px-3 py-3 font-mono text-sm leading-relaxed">
                  {targetUrl}
                </p>
              </div>
              <Button asChild className="h-11 w-full text-sm">
                <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("open")}
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </LinkShieldShell>
  );
}
