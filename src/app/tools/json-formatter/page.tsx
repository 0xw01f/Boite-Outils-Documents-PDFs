import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["json-formatter"];

import { JsonFormatterTool } from "@/features/json-formatter/components/json-formatter-tool";

export default function JsonFormatterPage() {
  return <JsonFormatterTool />;
}
