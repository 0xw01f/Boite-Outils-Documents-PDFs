"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Loader2, AlertCircle, Video, ExternalLink } from "lucide-react";

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

export function TwitterVideoTool() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<TweetInfo | null>(null);

  const analyze = async () => {
    if (!url.trim()) {
      setError("Veuillez coller l'URL du post X/Twitter.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch("/api/twitter-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      setInfo(data as TweetInfo);
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const downloadViaProxy = (videoUrl: string) => {
    const proxy = `/api/twitter-video?url=${encodeURIComponent(videoUrl)}`;
    const a = document.createElement("a");
    a.href = proxy;
    a.download = "twitter-video.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ToolLayout
      title="Téléchargeur X / Twitter"
      description="Collez le lien d'un post pour récupérer la vidéo en MP4."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tweet-url">Lien du post X / Twitter</Label>
          <div className="flex gap-2">
            <Input
              id="tweet-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://x.com/utilisateur/status/1234567890123456789"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") analyze();
              }}
            />
            <Button onClick={analyze} disabled={loading} className="shrink-0">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Video className="h-4 w-4 mr-2" />
              )}
              {loading ? "Analyse..." : "Récupérer"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Exemple : https://x.com/elonmusk/status/1800000000000000000
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {info && (
          <div className="space-y-4">
            {info.thumbnail && (
              <div className="overflow-hidden rounded-lg border bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={info.thumbnail}
                  alt="Aperçu"
                  className="w-full max-h-64 object-contain"
                />
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium">{info.author}</p>
              <p className="text-sm text-muted-foreground line-clamp-3">{info.title}</p>
            </div>

            <div className="space-y-2">
              <Label>Téléchargements disponibles</Label>
              <div className="grid gap-2">
                {info.videos.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 rounded-md border bg-background"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{v.quality}</p>
                      {v.bitrate && (
                        <p className="text-xs text-muted-foreground">
                          {(v.bitrate / 1000).toFixed(0)} kbps
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadViaProxy(v.url)}
                      >
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        MP4
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(v.url, "_blank")}
                        title="Ouvrir le lien direct"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
