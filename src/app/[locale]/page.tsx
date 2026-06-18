import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { toolCategories } from "@/lib/tools";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Image,
  Shield,
  Wrench,
  Combine,
  Scissors,
  Minimize2,
  RotateCw,
  Trash2,
  ArrowUpDown,
  FileOutput,
  FilePlus,
  ArrowRightLeft,
  Maximize,
  Tags,
  Fingerprint,
  Hash,
  Braces,
  Download,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Image, Shield, Wrench,
  Combine, Scissors, Minimize2, RotateCw,
  Trash2, ArrowUpDown, FileOutput, FilePlus,
  ArrowRightLeft, Maximize, Tags,
  Fingerprint, Hash, Braces, Download,
};

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  images: Image,
  security: Shield,
  utilities: Wrench,
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const h = await getTranslations({ locale, namespace: "home" });
  const c = await getTranslations({ locale, namespace: "categories" });
  const t = await getTranslations({ locale, namespace: "tools" });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-5 py-8">
        <h1 className="text-4xl font-bold tracking-tight">{h("title")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{h("subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {toolCategories.map((category) => {
          const CatIcon = categoryIconMap[category.id] || FileText;

          return (
            <Card key={category.id} className="col-span-1">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CatIcon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{c(category.id)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.tools.map((tool) => {
                  const ToolIcon = iconMap[tool.icon] || FileText;

                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors group"
                    >
                      <ToolIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <div>
                        <p className="text-sm font-medium">{t(`${tool.id}.name`)}</p>
                        <p className="text-xs text-muted-foreground">{t(`${tool.id}.description`)}</p>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
