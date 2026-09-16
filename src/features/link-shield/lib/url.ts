import { MAX_TTL_DAYS, MAX_URL_LENGTH, MIN_TTL_DAYS } from "@/features/link-shield/lib/constants";

export function normalizeTargetUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;

  return parsed.toString();
}

export function clampTtlDays(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 7;
  return Math.min(MAX_TTL_DAYS, Math.max(MIN_TTL_DAYS, Math.round(n)));
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

const DEFAULT_PUBLIC_ORIGIN = "https://tools.argus-labs.fr";

export function publicOrigin(req: { headers: Headers; nextUrl: URL }): string {
  const fromEnv = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (fromEnv && !isLocalHost(fromEnv)) return fromEnv;

  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.headers.get("host")?.split(",")[0]?.trim() || "";
  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (isLocalHost(host) ? "http" : "https");

  if (host && !isLocalHost(host)) {
    return `${proto}://${host}`;
  }

  return DEFAULT_PUBLIC_ORIGIN;
}

function isLocalHost(value: string): boolean {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0|::1/i.test(value);
}

export function publicShareUrl(req: { headers: Headers; nextUrl: URL }, locale: string, id: string): string {
  return `${publicOrigin(req)}/${locale}/tools/link-shield/${id}`;
}

export function rewriteLocalShareUrl(shareUrl: string): string {
  if (typeof window === "undefined") return shareUrl;
  try {
    const parsed = new URL(shareUrl);
    if (!isLocalHost(parsed.host)) return shareUrl;
    return `${window.location.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return shareUrl;
  }
}
