"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { toolCategories } from "@/lib/tools";
import {
  FileText,
  Image,
  Shield,
  Wrench,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
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
  Scale,
  Fingerprint,
  Hash,
  Braces,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

export function AppSidebar() {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["pdf", "images"]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-background border rounded-md shadow"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Logo className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">PDF & Docs</h1>
                <p className="text-xs text-muted-foreground">Outils locaux 100%</p>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            <nav className="px-2 space-y-1">
              {toolCategories.map((category) => {
                const Icon = iconMap[category.icon] || FileText;
                const isExpanded = expandedCategories.includes(category.id);

                return (
                  <div key={category.id}>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-0.5">
                        {category.tools.map((tool) => {
                          const ToolIcon = iconMap[tool.icon] || FileText;
                          const isActive = pathname === tool.href;

                          return (
                            <Link
                              key={tool.id}
                              href={tool.href}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                                isActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <ToolIcon className="h-3.5 w-3.5" />
                              <span>{tool.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-sidebar-border space-y-3">
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-600">
                <span className="flex gap-px">
                  <span className="block w-[3px] h-2 rounded-full opacity-60" style={{ backgroundColor: "#0055A4" }} />
                  <span className="block w-[3px] h-2 rounded-full opacity-60" style={{ backgroundColor: "#ccc" }} />
                  <span className="block w-[3px] h-2 rounded-full opacity-60" style={{ backgroundColor: "#EF4135" }} />
                </span>
                <span className="tracking-wide">100% local</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              Aucun fichier n'est jamais envoyé sur un serveur. Tout le traitement se fait dans votre navigateur.
            </p>
            <Link
              href="/legal"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-center gap-1.5 text-xs py-1.5 rounded-md transition-colors",
                pathname === "/legal"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Scale className="h-3 w-3" />
              <span>Mentions légales & Confidentialité</span>
            </Link>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">
                &copy; {new Date().getFullYear()} made by{" "}
                <a
                  href="https://argus-labs.fr/community"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Argus Labs
                </a>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
