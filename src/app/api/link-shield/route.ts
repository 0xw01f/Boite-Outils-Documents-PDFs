import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { allowCreate, saveLink } from "@/features/link-shield/lib/store";
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
    internalError: string;
  }
> = {
  fr: {
    invalidUrl: "URL invalide. Seuls les liens http(s) sont acceptés.",
    captchaFailed: "Vérification anti-bot échouée. Réessayez le captcha.",
    rateLimited: "Trop de créations. Réessayez plus tard.",
    internalError: "Erreur interne.",
  },
  en: {
    invalidUrl: "Invalid URL. Only http(s) links are accepted.",
    captchaFailed: "Bot check failed. Please retry the captcha.",
    rateLimited: "Too many creations. Try again later.",
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
    if (!(await verifyTurnstile(body?.turnstileToken, ip))) {
      return NextResponse.json({ error: t.captchaFailed }, { status: 400 });
    }

    const url = normalizeTargetUrl(body?.url);
    if (!url) {
      return NextResponse.json({ error: t.invalidUrl }, { status: 400 });
    }

    const ttlDays = clampTtlDays(body?.ttlDays ?? DEFAULT_TTL_DAYS);
    const id = nanoid();
    const createdAt = Date.now();
    const expiresAt = createdAt + ttlDays * 24 * 60 * 60 * 1000;

    await saveLink(id, { url, createdAt, expiresAt }, ttlDays * 24 * 60 * 60);

    const requestedLocale = body?.locale === "fr" || body?.locale === "en" ? body.locale : locale;

    return NextResponse.json({
      id,
      shareUrl: publicShareUrl(req.nextUrl.origin, requestedLocale, id),
      expiresAt,
    });
  } catch {
    return NextResponse.json({ error: t.internalError }, { status: 500 });
  }
}
