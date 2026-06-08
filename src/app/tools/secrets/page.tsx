import { toolMetadata } from "@/lib/seo";
export const metadata = toolMetadata["secrets"];

import { SecretsTool } from "@/features/uuid/components/secrets-tool";

export default function SecretsPage() {
  return <SecretsTool />;
}
