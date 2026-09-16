import { MAX_TTL_DAYS, MAX_URL_LENGTH, MIN_TTL_DAYS } from "@/features/link-shield/lib/constants";

const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export function normalizeTargetUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return null;

  if (trimmed.startsWith("//")) {
    trimmed = `https:${trimmed}`;
  } else if (!/^https?:\/\//i.test(trimmed)) {
    if (HAS_SCHEME.test(trimmed)) return null;
    trimmed = `https://${trimmed}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  if (parsed.username || parsed.password) return null;
  if (!isPublicHttpHost(parsed.hostname)) return null;

  return parsed.toString();
}

function isPublicHttpHost(hostname: string): boolean {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (!host || host.length > 253) return false;
  if (host.includes(":")) return true;
  if (host === "localhost") return true;
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) return true;
  return /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(host);
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
