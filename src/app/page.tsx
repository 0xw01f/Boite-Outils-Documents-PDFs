import Link from "next/link";
import { toolCategories } from "@/lib/tools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Image,
  Shield,
  Wrench,
  Combine,
  Scissors,
  Minimize2,
  Stamp,
  RotateCw,
  Trash2,
  ArrowUpDown,
  FileOutput,
  FilePlus,
  ArrowRightLeft,
  Maximize,
  Lock,
  Unlock,
  Tags,
  Fingerprint,
  Hash,
  Braces,
  Download,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Image, Shield, Wrench,
  Combine, Scissors, Minimize2, Stamp, RotateCw,
  Trash2, ArrowUpDown, FileOutput, FilePlus,
  ArrowRightLeft, Maximize, Lock, Unlock, Tags,
  Fingerprint, Hash, Braces, Download,
};

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  images: Image,
  security: Shield,
  utilities: Wrench,
};

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-5 py-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Boîte à Outils PDF & Documents
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tous les outils s'exécutent localement dans votre navigateur.
          Vos fichiers ne quittent jamais votre appareil.
        </p>
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
                  <CardTitle>{category.name}</CardTitle>
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
                        <p className="text-sm font-medium">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
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
