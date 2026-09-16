import { createClient, type RedisClientType } from "redis";
import {
  CREATE_RATE_LIMIT,
  CREATE_RATE_WINDOW_SEC,
  LINK_PREFIX,
  RL_PREFIX,
  type ShieldRecord,
} from "@/features/link-shield/lib/constants";

export type { ShieldRecord } from "@/features/link-shield/lib/constants";
export { isValidLinkId } from "@/features/link-shield/lib/constants";

export class LinkShieldStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LinkShieldStorageError";
  }
}

export function isStorageFailure(err: unknown): boolean {
  if (err instanceof LinkShieldStorageError) return true;
  if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "LinkShieldStorageError") {
    return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|Socket closed|Connection is closed|REDIS_URL/i.test(msg);
}

type MemoryStore = {
  links: Map<string, ShieldRecord>;
  rate: Map<string, { count: number; resetAt: number }>;
};

const globalStore = globalThis as typeof globalThis & {
  __linkShieldMemory?: MemoryStore;
  __linkShieldRedis?: RedisClientType;
  __linkShieldRedisPromise?: Promise<RedisClientType>;
};

function memory(): MemoryStore {
  if (!globalStore.__linkShieldMemory) {
    globalStore.__linkShieldMemory = {
      links: new Map(),
      rate: new Map(),
    };
  }
  return globalStore.__linkShieldMemory;
}

function redisUrl(): string | undefined {
  const direct = process.env.REDIS_URL?.trim();
  if (direct) return direct;

  const host = process.env.REDIS_HOST?.trim();
  if (!host) return undefined;

  const port = process.env.REDIS_PORT?.trim() || "6379";
  const password = process.env.REDIS_PASSWORD?.trim() || process.env.REDIS_PASS?.trim();
  const username = process.env.REDIS_USERNAME?.trim() || process.env.REDIS_USER?.trim();

  if (password) {
    const user = username ? encodeURIComponent(username) : "";
    const pass = encodeURIComponent(password);
    return `redis://${user}:${pass}@${host}:${port}`;
  }
  return `redis://${host}:${port}`;
}

function useMemoryFallback(): boolean {
  return !redisUrl() && process.env.NODE_ENV !== "production";
}

async function getRedis(): Promise<RedisClientType> {
  const url = redisUrl();
  if (!url) {
    throw new LinkShieldStorageError("REDIS_URL is not set");
  }
  if (globalStore.__linkShieldRedis?.isOpen) {
    return globalStore.__linkShieldRedis;
  }
  if (!globalStore.__linkShieldRedisPromise) {
    const client = createClient({ url }) as RedisClientType;
    client.on("error", (err) => {
      console.error("Redis error", err);
    });
    globalStore.__linkShieldRedisPromise = client
      .connect()
      .then(() => {
        globalStore.__linkShieldRedis = client;
        return client;
      })
      .catch((err) => {
        globalStore.__linkShieldRedisPromise = undefined;
        throw new LinkShieldStorageError(err instanceof Error ? err.message : "Redis connection failed");
      });
  }
  return globalStore.__linkShieldRedisPromise;
}

export async function saveLink(id: string, record: ShieldRecord, ttlSeconds: number): Promise<void> {
  if (useMemoryFallback()) {
    memory().links.set(id, record);
    return;
  }
  const redis = await getRedis();
  await redis.set(`${LINK_PREFIX}${id}`, JSON.stringify(record), { EX: ttlSeconds });
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
  const redis = await getRedis();
  const raw = await redis.get(`${LINK_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ShieldRecord;
  } catch {
    return null;
  }
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

  const redis = await getRedis();
  const redisKey = `${RL_PREFIX}${key}`;
  const count = await redis.incr(redisKey);
  if (count === 1) {
    await redis.expire(redisKey, CREATE_RATE_WINDOW_SEC);
  }
  return count <= CREATE_RATE_LIMIT;
}
