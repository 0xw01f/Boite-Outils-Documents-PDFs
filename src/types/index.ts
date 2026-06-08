export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  href: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  tools: Tool[];
}
