import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Boîte à Outils PDF & Documents — 100% local & sécurisé",
    template: "%s | Boîte à Outils PDF & Documents",
  },
  description: "Outils PDF et images gratuits, 100% locaux et sécurisés. Fusionnez, divisez, compressez, protégez, convertissez vos documents sans envoyer de données sur Internet.",
  keywords: ["PDF", "Outils PDF", "Fusionner PDF", "Diviser PDF", "Compresser PDF", "Filigrane PDF", "Convertir PDF", "Sécurité PDF", "100% local", "Offline"],
  authors: [{ name: "Argus Labs" }],
  creator: "Argus Labs",
  metadataBase: new URL("https://argus-labs.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Boîte à Outils PDF & Documents",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppSidebar />
        <main className="lg:pl-64 min-h-screen">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
