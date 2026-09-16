import { kv } from "@vercel/kv";
import {
  CREATE_RATE_LIMIT,
  CREATE_RATE_WINDOW_SEC,
  LINK_PREFIX,
  RL_PREFIX,
  type ShieldRecord,
} from "@/features/link-shield/lib/constants";

export type { ShieldRecord } from "@/features/link-shield/lib/constants";
export { isValidLinkId } from "@/features/link-shield/lib/constants";

type MemoryStore = {
  links: Map<string, ShieldRecord>;
  rate: Map<string, { count: number; resetAt: number }>;
};

const globalStore = globalThis as typeof globalThis & { __linkShieldMemory?: MemoryStore };

function memory(): MemoryStore {
  if (!globalStore.__linkShieldMemory) {
    globalStore.__linkShieldMemory = {
      links: new Map(),
      rate: new Map(),
    };
  }
  return globalStore.__linkShieldMemory;
}

function useMemoryFallback(): boolean {
  return process.env.NODE_ENV !== "production" && !process.env.KV_REST_API_URL;
}

export async function saveLink(id: string, record: ShieldRecord, ttlSeconds: number): Promise<void> {
  if (useMemoryFallback()) {
    memory().links.set(id, record);
    return;
  }
  await kv.set(`${LINK_PREFIX}${id}`, record, { ex: ttlSeconds });
}

export async function getLink(id: string): Promise<ShieldRecord | null> {
  if (useMemoryFallback()) {
    const record = memory().links.get(id);
    if (!record) return null;
    if (record.expiresAt <= Date.now()) {
      memory().links.delete(id);
      return null;
    }
    return record;
  }
  return (await kv.get<ShieldRecord>(`${LINK_PREFIX}${id}`)) ?? null;
}

export async function allowCreate(ip: string): Promise<boolean> {
  const key = ip.replace(/[^a-zA-Z0-9:._-]/g, "_").slice(0, 80) || "unknown";

  if (useMemoryFallback()) {
    const now = Date.now();
    const current = memory().rate.get(key);
    if (!current || current.resetAt <= now) {
      memory().rate.set(key, { count: 1, resetAt: now + CREATE_RATE_WINDOW_SEC * 1000 });
      return true;
    }
    current.count += 1;
    return current.count <= CREATE_RATE_LIMIT;
  }

  const redisKey = `${RL_PREFIX}${key}`;
  const count = await kv.incr(redisKey);
  if (count === 1) {
    await kv.expire(redisKey, CREATE_RATE_WINDOW_SEC);
  }
  return count <= CREATE_RATE_LIMIT;
}
