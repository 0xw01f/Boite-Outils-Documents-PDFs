import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { allowCreate, isStorageFailure, saveLink } from "@/features/link-shield/lib/store";
import { DEFAULT_TTL_DAYS } from "@/features/link-shield/lib/constants";
import { verifyTurnstile } from "@/features/link-shield/lib/turnstile";
import { clampTtlDays, clientIp, normalizeTargetUrl, publicShareUrl } from "@/features/link-shield/lib/url";

export const runtime = "nodejs";

type Locale = "fr" | "en";

const messages: Record<
  Locale,
  {
    invalidUrl: string;
    captchaFailed: string;
    rateLimited: string;
    storageError: string;
    internalError: string;
  }
> = {
  fr: {
    invalidUrl: "Lien invalide. Un domaine (exemple.com) ou une URL http(s) est accepté.",
    captchaFailed: "Vérification anti-bot échouée. Réessayez le captcha.",
    rateLimited: "Trop de créations. Réessayez plus tard.",
    storageError: "Redis inaccessible. Vérifiez REDIS_URL (ou REDIS_HOST) dans Coolify.",
    internalError: "Erreur interne.",
  },
  en: {
    invalidUrl: "Invalid link. A domain (example.com) or an http(s) URL is accepted.",
    captchaFailed: "Bot check failed. Please retry the captcha.",
    rateLimited: "Too many creations. Try again later.",
    storageError: "Redis is unreachable. Check REDIS_URL (or REDIS_HOST) in Coolify.",
    internalError: "Internal error.",
  },
};

async function getMessages() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "en";
  return { t: messages[locale] ?? messages.en, locale: (messages[locale] ? locale : "en") as Locale };
}

export async function POST(req: NextRequest) {
  const { t, locale } = await getMessages();
  const ip = clientIp(req.headers);

  try {
    if (!(await allowCreate(ip))) {
      return NextResponse.json({ error: t.rateLimited }, { status: 429 });
    }

    const body = await req.json();
    const url = normalizeTargetUrl(body?.url);
    if (!url) {
      return NextResponse.json({ error: t.invalidUrl }, { status: 400 });
    }

    if (!(await verifyTurnstile(body?.turnstileToken, ip))) {
      return NextResponse.json({ error: t.captchaFailed }, { status: 400 });
    }

    const ttlDays = clampTtlDays(body?.ttlDays ?? DEFAULT_TTL_DAYS);
    const id = nanoid();
    const createdAt = Date.now();
    const expiresAt = createdAt + ttlDays * 24 * 60 * 60 * 1000;

    await saveLink(id, { url, createdAt, expiresAt }, ttlDays * 24 * 60 * 60);

    const requestedLocale = body?.locale === "fr" || body?.locale === "en" ? body.locale : locale;

    return NextResponse.json({
      id,
      shareUrl: publicShareUrl(req, requestedLocale, id),
      expiresAt,
    });
  } catch (err) {
    console.error("link-shield create failed", err);
    if (isStorageFailure(err)) {
      return NextResponse.json({ error: t.storageError }, { status: 503 });
    }
    return NextResponse.json({ error: t.internalError }, { status: 500 });
  }
}
