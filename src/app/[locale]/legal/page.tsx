import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Server, Eye, FileCheck, Lock, Mail, Code } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const year = new Date().getFullYear();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
          <ShieldCheck className="h-4 w-4" />
          {t("badge")}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("updated", { date: new Date().toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" }) })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>{t("editor.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>{t("editor.p1")}</p>
          <p>{t("editor.p2")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>{t("privacy.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <p className="font-semibold text-base">{t("privacy.commitment")}</p>
          <p>{t("privacy.commitmentText")}</p>

          <h3 className="font-semibold text-base">{t("privacy.data")}</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>{t("privacy.documents")}</strong> {t("privacy.documentsText")}
            </li>
            <li>
              <strong>{t("privacy.persistence")}</strong> {t("privacy.persistenceText")}
            </li>
            <li>
              <strong>{t("privacy.collection")}</strong> {t("privacy.collectionText")}
            </li>
          </ul>

          <h3 className="font-semibold text-base">{t("privacy.cookies")}</h3>
          <p>{t("privacy.cookiesText")}</p>

          <h3 className="font-semibold text-base">{t("privacy.hosting")}</h3>
          <p>{t("privacy.hostingText")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>{t("terms.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <h3 className="font-semibold text-base">{t("terms.purpose")}</h3>
          <p>{t("terms.purposeText")}</p>

          <h3 className="font-semibold text-base">{t("terms.responsibilities")}</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>{t("terms.resp1")}</li>
            <li>{t("terms.resp2")}</li>
            <li>{t("terms.resp3")}</li>
          </ul>

          <h3 className="font-semibold text-base">{t("terms.limitation")}</h3>
          <p>{t("terms.limitationText")}</p>

          <h3 className="font-semibold text-base">{t("terms.property")}</h3>
          <p>{t("terms.propertyText")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>{t("credits.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>{t("credits.intro")}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            <li className="p-2 rounded-md bg-muted/50"><strong>Next.js</strong> — {t("credits.next")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>TypeScript</strong> — {t("credits.typescript")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>Tailwind CSS</strong> — {t("credits.tailwind")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>shadcn/ui</strong> — {t("credits.shadcn")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>pdf-lib</strong> — {t("credits.pdflib")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>pdfjs-dist</strong> — {t("credits.pdfjs")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>jspdf</strong> — {t("credits.jspdf")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>browser-image-compression</strong> — {t("credits.browserImage")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>JSZip</strong> — {t("credits.jszip")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>Lucide React</strong> — {t("credits.lucide")}</li>
            <li className="p-2 rounded-md bg-muted/50"><strong>Radix UI</strong> — {t("credits.radix")}</li>
          </ul>
          <p className="text-muted-foreground">{t("credits.note")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>{t("gdpr.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>{t("gdpr.p1")}</p>
          <p>{t("gdpr.p2")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>{t("contact.title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed">
          <p>{t("contact.text")}</p>
          <p className="mt-2 font-mono text-muted-foreground">{t("contact.email")}</p>
        </CardContent>
      </Card>

      <Separator />

      <div className="text-center text-sm text-muted-foreground pb-8">
        <p>
          {t("footer.copyright", { year })}
          <Link href="/" className="underline hover:text-foreground ml-1">
            {t("footer.back")}
          </Link>
        </p>
      </div>
    </div>
  );
}
