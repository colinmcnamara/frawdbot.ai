/**
 * A2A Rate Limiting Middleware
 */

import type { A2AConfig } from '../core/config';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter?: number;
}

const rateLimitStore = new Map<string, { tokens: number; lastRefill: number }>();

export async function rateLimitRequest(
  request: Request,
  config: A2AConfig
): Promise<RateLimitResult> {
  const clientId = getClientId(request);
  const now = Date.now();
  let data = rateLimitStore.get(clientId);

  if (!data) {
    data = { tokens: config.rateLimitRequests, lastRefill: now };
    rateLimitStore.set(clientId, data);
  }

  const timePassed = now - data.lastRefill;
  const tokensToAdd = Math.floor(timePassed / config.rateLimitWindow * config.rateLimitRequests);

  if (tokensToAdd > 0) {
    data.tokens = Math.min(config.rateLimitRequests, data.tokens + tokensToAdd);
    data.lastRefill = now;
  }

  if (data.tokens > 0) {
    data.tokens--;
    return { allowed: true, limit: config.rateLimitRequests, remaining: data.tokens };
  }

  const timeUntilRefill = config.rateLimitWindow - (now - data.lastRefill);
  return {
    allowed: false,
    limit: config.rateLimitRequests,
    remaining: 0,
    retryAfter: Math.ceil(timeUntilRefill / 1000),
  };
}

function getClientId(request: Request): string {
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (bearerMatch) return `api_${hashString(bearerMatch[1])}`;
  }

  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) return `ip_${forwarded.split(',')[0].trim()}`;

  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return `ip_${cfIp}`;

  const realIp = request.headers.get('X-Real-IP');
  if (realIp) return `ip_${realIp}`;

  return 'ip_unknown';
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
