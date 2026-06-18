import { ToolCategory } from "@/types";

export const toolCategories: ToolCategory[] = [
  {
    id: "pdf",
    name: "PDF",
    icon: "FileText",
    tools: [
      { id: "merge-pdf", name: "Fusionner PDF", description: "Combinez plusieurs PDF en un seul", icon: "Combine", category: "pdf", href: "/tools/merge-pdf" },
      { id: "split-pdf", name: "Diviser PDF", description: "Séparez un PDF en plusieurs fichiers", icon: "Scissors", category: "pdf", href: "/tools/split-pdf" },
      { id: "compress-pdf", name: "Compresser PDF", description: "Réduisez la taille de vos PDF", icon: "Minimize2", category: "pdf", href: "/tools/compress-pdf" },
      { id: "rotate-pdf", name: "Rotation PDF", description: "Faites pivoter les pages", icon: "RotateCw", category: "pdf", href: "/tools/rotate-pdf" },
      { id: "delete-pages", name: "Supprimer pages", description: "Supprimez des pages d'un PDF", icon: "Trash2", category: "pdf", href: "/tools/delete-pages" },
      { id: "reorder-pages", name: "Réorganiser pages", description: "Changez l'ordre des pages", icon: "ArrowUpDown", category: "pdf", href: "/tools/reorder-pages" },
      { id: "extract-pages", name: "Extraire pages", description: "Extrayez des pages spécifiques", icon: "FileOutput", category: "pdf", href: "/tools/extract-pages" },
      { id: "pdf-to-images", name: "PDF -> Images", description: "Convertissez un PDF en images", icon: "Image", category: "pdf", href: "/tools/pdf-to-images" },
      { id: "images-to-pdf", name: "Images -> PDF", description: "Combinez des images en PDF", icon: "FilePlus", category: "pdf", href: "/tools/images-to-pdf" },
    ],
  },
  {
    id: "images",
    name: "Images",
    icon: "Image",
    tools: [
      { id: "compress-image", name: "Compresser Image", description: "Réduisez la taille sans perdre en qualité", icon: "Minimize2", category: "images", href: "/tools/compress-image" },
      { id: "convert-image", name: "Convertir Format", description: "Changez le format de vos images", icon: "ArrowRightLeft", category: "images", href: "/tools/convert-image" },
      { id: "resize-image", name: "Redimensionner", description: "Changez les dimensions de vos images", icon: "Maximize", category: "images", href: "/tools/resize-image" },
    ],
  },
  {
    id: "security",
    name: "Sécurité",
    icon: "Shield",
    tools: [
      { id: "metadata-manager", name: "Métadonnées PDF", description: "Lire, modifier ou supprimer", icon: "Tags", category: "security", href: "/tools/metadata-manager" },
    ],
  },
  {
    id: "utilities",
    name: "Utilitaires",
    icon: "Wrench",
    tools: [
      { id: "secrets", name: "Générateur de secrets", description: "UUID, clés API, tokens, mots de passe", icon: "Fingerprint", category: "utilities", href: "/tools/secrets" },
      { id: "hash", name: "Hash", description: "Calculez le hash d'un texte ou fichier", icon: "Hash", category: "utilities", href: "/tools/hash" },
      { id: "json-formatter", name: "JSON Formatter", description: "Formatez et validez du JSON", icon: "Braces", category: "utilities", href: "/tools/json-formatter" },
      { id: "twitter-video", name: "Téléchargeur X", description: "Téléchargez les vidéos de X/Twitter", icon: "Download", category: "utilities", href: "/tools/twitter-video" },
    ],
  },
];

export const allTools = toolCategories.flatMap((cat) => cat.tools);
