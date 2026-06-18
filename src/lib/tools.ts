export interface ToolDefinition {
  id: string;
  icon: string;
  href: string;
}

export interface ToolCategoryDefinition {
  id: string;
  icon: string;
  tools: ToolDefinition[];
}

export const toolCategories: ToolCategoryDefinition[] = [
  {
    id: "pdf",
    icon: "FileText",
    tools: [
      { id: "merge-pdf", icon: "Combine", href: "/tools/merge-pdf" },
      { id: "split-pdf", icon: "Scissors", href: "/tools/split-pdf" },
      { id: "compress-pdf", icon: "Minimize2", href: "/tools/compress-pdf" },
      { id: "rotate-pdf", icon: "RotateCw", href: "/tools/rotate-pdf" },
      { id: "delete-pages", icon: "Trash2", href: "/tools/delete-pages" },
      { id: "reorder-pages", icon: "ArrowUpDown", href: "/tools/reorder-pages" },
      { id: "extract-pages", icon: "FileOutput", href: "/tools/extract-pages" },
      { id: "pdf-to-images", icon: "Image", href: "/tools/pdf-to-images" },
      { id: "images-to-pdf", icon: "FilePlus", href: "/tools/images-to-pdf" },
    ],
  },
  {
    id: "images",
    icon: "Image",
    tools: [
      { id: "compress-image", icon: "Minimize2", href: "/tools/compress-image" },
      { id: "convert-image", icon: "ArrowRightLeft", href: "/tools/convert-image" },
      { id: "resize-image", icon: "Maximize", href: "/tools/resize-image" },
    ],
  },
  {
    id: "security",
    icon: "Shield",
    tools: [{ id: "metadata-manager", icon: "Tags", href: "/tools/metadata-manager" }],
  },
  {
    id: "utilities",
    icon: "Wrench",
    tools: [
      { id: "secrets", icon: "Fingerprint", href: "/tools/secrets" },
      { id: "hash", icon: "Hash", href: "/tools/hash" },
      { id: "json-formatter", icon: "Braces", href: "/tools/json-formatter" },
      { id: "twitter-video", icon: "Download", href: "/tools/twitter-video" },
    ],
  },
];

export const allTools = toolCategories.flatMap((cat) => cat.tools);
