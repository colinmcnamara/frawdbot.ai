/**
 * A2A Protocol Caching Utilities
 */

import type { JsonRpcRequest, JsonRpcResponse } from '../types';
import crypto from 'crypto';

export interface CacheConfig {
  ttl: {
    metadata: number;
    default: number;
  };
  staleWhileRevalidate: boolean;
  varyHeaders: string[];
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: {
    metadata: 3600,
    default: 300,
  },
  staleWhileRevalidate: true,
  varyHeaders: ['Accept', 'Accept-Encoding', 'Content-Type', 'X-Cache-Key'],
};

export function generateCacheKey(request: JsonRpcRequest): string {
  const data = { method: request.method, params: request.params || {} };
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

export function generateResponseETag(content: any): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(content)).digest('base64url');
  return `"${hash}"`;
}

export function addCacheHeaders(
  headers: Headers,
  _method: string,
  response: JsonRpcResponse,
  _config: CacheConfig = DEFAULT_CACHE_CONFIG
): void {
  const etag = generateResponseETag(response);
  headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  headers.set('ETag', etag);
  headers.set('Vary', 'Accept, Accept-Encoding, Content-Type, X-Cache-Key, Origin');
  headers.set('Expires', '0');
  headers.set('Pragma', 'no-cache');
  headers.set('CDN-Cache-Control', 'no-store');
  headers.set('Surrogate-Control', 'no-store');
  headers.set('Vercel-CDN-Cache-Control', 'no-store');
  headers.set('x-vercel-no-cache', '1');
}

export function checkETagMatch(_request: Request, _etag: string): boolean {
  return false;
}

export function createNotModifiedResponse(etag: string): Response {
  return new Response(null, {
    status: 304,
    headers: { 'ETag': etag, 'Cache-Control': 'public, max-age=0' },
  });
}

export function withCache(
  request: Request,
  jsonRpcRequest: JsonRpcRequest,
  response: JsonRpcResponse,
  headers: Headers,
  config: CacheConfig = DEFAULT_CACHE_CONFIG
): Response | null {
  if ('error' in response || !jsonRpcRequest.id) return null;

  const etag = generateResponseETag(response);
  if (checkETagMatch(request, etag)) return createNotModifiedResponse(etag);

  addCacheHeaders(headers, jsonRpcRequest.method, response, config);
  return null;
}
