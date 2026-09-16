"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, ExternalLink, Loader2, Shield } from "lucide-react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TurnstileWidget } from "@/features/link-shield/components/turnstile-widget";

export function LinkShieldGate({ id }: { id: string }) {
  const t = useTranslations("tool.linkShieldGate");
  const [token, setToken] = useState<string | null>(
    process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      ? "dev-bypass"
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

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
        setError(data.error || t("apiError"));
        return;
      }
      setTargetUrl(data.url as string);
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>{t("notice")}</AlertDescription>
        </Alert>

        {!targetUrl && (
          <>
            <TurnstileWidget onToken={setToken} />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={reveal} disabled={loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
              {loading ? t("processing") : t("action")}
            </Button>
          </>
        )}

        {targetUrl && (
          <div className="space-y-3 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{t("revealed")}</p>
            <p className="break-all font-mono text-sm">{targetUrl}</p>
            <Button asChild>
              <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t("open")}
              </a>
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
