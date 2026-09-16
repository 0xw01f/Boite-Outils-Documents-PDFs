import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLink, isStorageFailure } from "@/features/link-shield/lib/store";
import { isValidLinkId } from "@/features/link-shield/lib/constants";
import { verifyTurnstile } from "@/features/link-shield/lib/turnstile";
import { clientIp } from "@/features/link-shield/lib/url";

export const runtime = "nodejs";

type Locale = "fr" | "en";

const messages: Record<
  Locale,
  {
    captchaFailed: string;
    notFound: string;
    storageError: string;
    internalError: string;
  }
> = {
  fr: {
    captchaFailed: "Vérification anti-bot échouée. Réessayez le captcha.",
    notFound: "Lien introuvable ou expiré.",
    storageError: "Redis inaccessible. Vérifiez REDIS_URL (ou REDIS_HOST) dans Coolify.",
    internalError: "Erreur interne.",
  },
  en: {
    captchaFailed: "Bot check failed. Please retry the captcha.",
    notFound: "Link not found or expired.",
    storageError: "Redis is unreachable. Check REDIS_URL (or REDIS_HOST) in Coolify.",
    internalError: "Internal error.",
  },
};

async function getMessages() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "en";
  return messages[locale] ?? messages.en;
}

export async function POST(req: NextRequest) {
  const t = await getMessages();
  const ip = clientIp(req.headers);

  try {
    const body = await req.json();
    if (!(await verifyTurnstile(body?.turnstileToken, ip))) {
      return NextResponse.json({ error: t.captchaFailed }, { status: 400 });
    }

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!isValidLinkId(id)) {
      return NextResponse.json({ error: t.notFound }, { status: 404 });
    }

    const record = await getLink(id);
    if (!record || record.expiresAt <= Date.now()) {
      return NextResponse.json({ error: t.notFound }, { status: 404 });
    }

    return NextResponse.json({ url: record.url, expiresAt: record.expiresAt });
  } catch (err) {
    console.error("link-shield reveal failed", err);
    if (isStorageFailure(err)) {
      return NextResponse.json({ error: t.storageError }, { status: 503 });
    }
    return NextResponse.json({ error: t.internalError }, { status: 500 });
  }
}
