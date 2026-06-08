import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["hash"];

import { HashTool } from "@/features/hash/components/hash-tool";

export default function HashPage() {
  return <HashTool />;
}
