export const LINK_ID_LENGTH = 21;
export const LINK_ID_PATTERN = /^[A-Za-z0-9_-]{21}$/;
export const MAX_URL_LENGTH = 2048;
export const MIN_TTL_DAYS = 1;
export const MAX_TTL_DAYS = 30;
export const DEFAULT_TTL_DAYS = 7;
export const CREATE_RATE_LIMIT = 20;
export const CREATE_RATE_WINDOW_SEC = 60 * 60;

export const LINK_PREFIX = "link-shield:";
export const RL_PREFIX = "link-shield:rl:";

export type ShieldRecord = {
  url: string;
  createdAt: number;
  expiresAt: number;
};

export function isValidLinkId(id: string): boolean {
  return LINK_ID_PATTERN.test(id);
}
