"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Logo } from "@/components/logo";

export function LinkShieldShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("tool.linkShieldShell");
  const locale = useLocale();

  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -10%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />

      <div className="relative mx-auto flex min-h-full w-full max-w-lg flex-col px-5 py-8 sm:py-12">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Link href={`/${locale}/tools/link-shield`} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Logo className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">{t("brand")}</p>
              <p className="text-[11px] text-muted-foreground">{t("tagline")}</p>
            </div>
          </Link>
          <Link
            href={`/${locale}`}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("back")}
          </Link>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-14 text-center text-[11px] leading-relaxed text-muted-foreground">
          {t("footer")}
        </footer>
      </div>
    </div>
  );
}
