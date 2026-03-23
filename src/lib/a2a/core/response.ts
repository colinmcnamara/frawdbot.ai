/**
 * JSON-RPC Response Builders
 */

import type { JsonRpcResponse, JsonRpcError, JsonRpcRequest } from '../types';
import { getAllSecurityHeaders, getCorsHeaders, addRateLimitHeaders } from './security-headers';
import { withCache, DEFAULT_CACHE_CONFIG, generateCacheKey, type CacheConfig } from './cache';

export function createSuccessResponse(result: any, id: string | number | null): JsonRpcResponse {
  return { jsonrpc: '2.0', result, id };
}

export function createErrorResponse(error: JsonRpcError, id: string | number | null = null): JsonRpcResponse {
  return { jsonrpc: '2.0', error, id };
}

export function jsonRpcResponse(response: JsonRpcResponse, status: number = 200): Response {
  const headers = getAllSecurityHeaders(false);
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function jsonRpcCorsResponse(response: JsonRpcResponse, status: number = 200): Response {
  const headers = getAllSecurityHeaders(true);
  return new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

export function corsPreflightResponse(): Response {
  const corsHeaders = getCorsHeaders();
  return new Response(null, { status: 204, headers: corsHeaders });
}

export function jsonRpcResponseWithRateLimit(
  response: JsonRpcResponse,
  rateLimitInfo?: { limit: number; remaining: number; retryAfter?: number },
  status: number = 200
): Response {
  const headers = getAllSecurityHeaders(true);
  const responseObj = new Response(JSON.stringify(response), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  if (rateLimitInfo) addRateLimitHeaders(responseObj.headers, rateLimitInfo);
  return responseObj;
}

export function jsonRpcCachedResponse(
  request: Request,
  jsonRpcRequest: JsonRpcRequest,
  response: JsonRpcResponse,
  rateLimitInfo?: { limit: number; remaining: number; retryAfter?: number },
  cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG,
  status: number = 200
): Response {
  const headers = getAllSecurityHeaders(true);
  const responseHeaders = new Headers({ 'Content-Type': 'application/json', ...headers });
  const cacheKey = generateCacheKey(jsonRpcRequest);
  responseHeaders.set('X-Cache-Key', cacheKey);

  const cachedResponse = withCache(request, jsonRpcRequest, response, responseHeaders, cacheConfig);
  if (cachedResponse) return cachedResponse;

  if (rateLimitInfo) addRateLimitHeaders(responseHeaders, rateLimitInfo);

  return new Response(JSON.stringify(response), { status, headers: responseHeaders });
}
