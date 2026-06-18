import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface VideoVariant {
  url: string;
  quality: string;
  bitrate?: number;
}

interface TweetInfo {
  title: string;
  author: string;
  thumbnail?: string;
  videos: VideoVariant[];
}

type Locale = "fr" | "en";

const messages: Record<
  Locale,
  {
    missingUrl: string;
    invalidUrl: string;
    notFound: string;
    internalError: string;
    downloadFailed: string;
    proxyError: string;
    defaultAuthor: string;
    defaultTitle: string;
    unknownQuality: string;
    mp4: string;
  }
> = {
  fr: {
    missingUrl: "URL manquante.",
    invalidUrl: "URL invalide. Format attendu : https://x.com/utilisateur/status/123456789",
    notFound: "Impossible d'extraire la vidéo. Le tweet est peut-être privé ou indisponible.",
    internalError: "Erreur interne.",
    downloadFailed: "Téléchargement échoué.",
    proxyError: "Erreur de proxy.",
    defaultAuthor: "Twitter",
    defaultTitle: "Twitter Video",
    unknownQuality: "Unknown",
    mp4: "MP4",
  },
  en: {
    missingUrl: "Missing URL.",
    invalidUrl: "Invalid URL. Expected format: https://x.com/user/status/123456789",
    notFound: "Unable to extract the video. The tweet may be private or unavailable.",
    internalError: "Internal error.",
    downloadFailed: "Download failed.",
    proxyError: "Proxy error.",
    defaultAuthor: "Twitter",
    defaultTitle: "Twitter Video",
    unknownQuality: "Unknown",
    mp4: "MP4",
  },
};

async function getMessages() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as Locale) || "en";
  return messages[locale] ?? messages.en;
}

function extractTweetPath(url: string): string | null {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/^\/([^/]+)\/status\/(\d+)/);
    if (m) return `${m[1]}/status/${m[2]}`;
  } catch {
    return null;
  }
  const m2 = url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/);
  if (m2) return `${m2[1]}/status/${m2[2]}`;
  return null;
}

async function fetchFromFxTwitter(path: string, t: (typeof messages)["en"]): Promise<TweetInfo | null> {
  try {
    const res = await fetch(`https://api.fxtwitter.com/${path}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PDFTools/1.0)",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const tweet = data?.tweet || data;
    const author = tweet?.author?.name || tweet?.author?.screen_name || t.defaultAuthor;
    const text = tweet?.text || "";
    const media = tweet?.media;
    const videos: VideoVariant[] = [];

    if (media?.videos) {
      for (const v of media.videos) {
        videos.push({
          url: v.url,
          quality: v.quality || t.unknownQuality,
          bitrate: v.bitrate,
        });
      }
    } else if (media?.video) {
      videos.push({
        url: media.video.url,
        quality: media.video.quality || t.unknownQuality,
        bitrate: media.video.bitrate,
      });
    }

    if (videos.length === 0) return null;

    return {
      title: text.slice(0, 120) || t.defaultTitle,
      author,
      thumbnail: media?.videos?.[0]?.thumbnail_url || media?.thumbnail_url || media?.poster,
      videos,
    };
  } catch {
    return null;
  }
}

async function fetchFromVxTwitter(path: string, t: (typeof messages)["en"]): Promise<TweetInfo | null> {
  try {
    const res = await fetch(`https://api.vxtwitter.com/${path}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PDFTools/1.0)",
      },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.text || "";
    const author = data?.user_name || data?.user_screen_name || t.defaultAuthor;
    const media = data?.mediaURLs || [];
    const thumb = data?.media_extended?.[0]?.thumbnail_url || data?.media_extended?.[0]?.url;

    const videos: VideoVariant[] = [];
    const extended = data?.media_extended || [];
    for (const m of extended) {
      if (m.type === "video" || m.type === "gif") {
        videos.push({
          url: m.url,
          quality: `${m.size?.width || ""}x${m.size?.height || ""}`,
        });
      }
    }
    if (videos.length === 0 && media.length > 0) {
      for (const url of media) {
        if (url.includes("video.twimg.com")) {
          videos.push({ url, quality: t.mp4 });
        }
      }
    }

    if (videos.length === 0) return null;

    return {
      title: text.slice(0, 120) || t.defaultTitle,
      author,
      thumbnail: thumb,
      videos,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const t = await getMessages();

  try {
    const body = await req.json();
    const url = body?.url?.trim() as string;

    if (!url) {
      return NextResponse.json({ error: t.missingUrl }, { status: 400 });
    }

    const path = extractTweetPath(url);
    if (!path) {
      return NextResponse.json(
        { error: t.invalidUrl },
        { status: 400 }
      );
    }

    let info = await fetchFromFxTwitter(path, t);
    if (!info) {
      info = await fetchFromVxTwitter(path, t);
    }

    if (!info) {
      return NextResponse.json(
        { error: t.notFound },
        { status: 404 }
      );
    }

    return NextResponse.json(info);
  } catch {
    return NextResponse.json({ error: t.internalError }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const t = await getMessages();

  const videoUrl = req.nextUrl.searchParams.get("url");
  if (!videoUrl) {
    return NextResponse.json({ error: t.missingUrl }, { status: 400 });
  }

  try {
    const res = await fetch(videoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0",
        Accept: "video/webm,video/mp4,video/*,*/*",
        Referer: "https://twitter.com/",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: t.downloadFailed }, { status: 502 });
    }

    const headers = new Headers();
    const contentType = res.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="twitter-video.mp4"`);

    return new NextResponse(res.body, { headers, status: 200 });
  } catch {
    return NextResponse.json({ error: t.proxyError }, { status: 500 });
  }
}
