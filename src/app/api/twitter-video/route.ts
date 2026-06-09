import { NextRequest, NextResponse } from "next/server";

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

function extractTweetPath(url: string): string | null {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/^\/([^/]+)\/status\/(\d+)/);
    if (m) return `${m[1]}/status/${m[2]}`;
  } catch {
    // ignore
  }
  // x.com/username/status/123 or twitter.com/...
  const m2 = url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/);
  if (m2) return `${m2[1]}/status/${m2[2]}`;
  return null;
}

async function fetchFromFxTwitter(path: string): Promise<TweetInfo | null> {
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
    const author = tweet?.author?.name || tweet?.author?.screen_name || "Twitter";
    const text = tweet?.text || "";
    const media = tweet?.media;
    const videos: VideoVariant[] = [];

    if (media?.videos) {
      for (const v of media.videos) {
        videos.push({
          url: v.url,
          quality: v.quality || "Unknown",
          bitrate: v.bitrate,
        });
      }
    } else if (media?.video) {
      videos.push({
        url: media.video.url,
        quality: media.video.quality || "Unknown",
        bitrate: media.video.bitrate,
      });
    }

    if (videos.length === 0) return null;

    return {
      title: text.slice(0, 120) || "Twitter Video",
      author,
      thumbnail: media?.videos?.[0]?.thumbnail_url || media?.thumbnail_url || media?.poster,
      videos,
    };
  } catch {
    return null;
  }
}

async function fetchFromVxTwitter(path: string): Promise<TweetInfo | null> {
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
    const author = data?.user_name || data?.user_screen_name || "Twitter";
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
    // Fallback to mediaURLs if no extended info
    if (videos.length === 0 && media.length > 0) {
      for (const url of media) {
        if (url.includes("video.twimg.com")) {
          videos.push({ url, quality: "MP4" });
        }
      }
    }

    if (videos.length === 0) return null;

    return {
      title: text.slice(0, 120) || "Twitter Video",
      author,
      thumbnail: thumb,
      videos,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url?.trim() as string;

    if (!url) {
      return NextResponse.json({ error: "URL manquante." }, { status: 400 });
    }

    const path = extractTweetPath(url);
    if (!path) {
      return NextResponse.json(
        { error: "URL invalide. Format attendu : https://x.com/utilisateur/status/123456789" },
        { status: 400 }
      );
    }

    let info = await fetchFromFxTwitter(path);
    if (!info) {
      info = await fetchFromVxTwitter(path);
    }

    if (!info) {
      return NextResponse.json(
        { error: "Impossible d'extraire la vidéo. Le tweet est peut-être privé ou indisponible." },
        { status: 404 }
      );
    }

    return NextResponse.json(info);
  } catch {
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}

// Proxy download endpoint to avoid CORS issues on direct links
export async function GET(req: NextRequest) {
  const videoUrl = req.nextUrl.searchParams.get("url");
  if (!videoUrl) {
    return NextResponse.json({ error: "URL manquante." }, { status: 400 });
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
      return NextResponse.json({ error: "Téléchargement échoué." }, { status: 502 });
    }

    const headers = new Headers();
    const contentType = res.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);
    headers.set("Content-Disposition", `attachment; filename="twitter-video.mp4"`);

    return new NextResponse(res.body, { headers, status: 200 });
  } catch {
    return NextResponse.json({ error: "Erreur de proxy." }, { status: 500 });
  }
}
