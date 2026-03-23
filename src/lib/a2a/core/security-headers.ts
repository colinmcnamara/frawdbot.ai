/**
 * Security Headers Configuration
 */

import { getA2AConfig } from './config';

export interface SecurityHeaders {
  [key: string]: string;
}

export function getSecurityHeaders(): SecurityHeaders {
  const config = getA2AConfig();

  const headers: SecurityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
    'X-A2A-Version': '1.0.0',
    'X-A2A-Protocol': 'JSON-RPC 2.0',
    'X-License': 'Proprietary',
    'X-License-URL': 'https://frawdbot.ai/legal/terms',
    'X-Attribution-Required': 'true',
    'X-Attribution-Policy': 'https://frawdbot.ai/legal/attribution',
    'Cache-Control': 'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'CDN-Cache-Control': 'no-store',
    'Surrogate-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
    'x-vercel-no-cache': '1',
  };

  if (config.debug) {
    headers['X-A2A-Debug'] = 'true';
    headers['X-A2A-Instance'] = config.instanceId || 'unknown';
  }

  return headers;
}

export function getCorsHeaders(config?: any): SecurityHeaders {
  const a2aConfig = config || getA2AConfig();

  const corsHeaders: SecurityHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Expose-Headers': 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-License, X-License-URL, X-Attribution-Required, X-Attribution-Policy',
  };

  if (a2aConfig.authEnabled) {
    corsHeaders['Access-Control-Allow-Credentials'] = 'true';
  }

  return corsHeaders;
}

export function getAllSecurityHeaders(includesCors: boolean = true): SecurityHeaders {
  const securityHeaders = getSecurityHeaders();
  if (includesCors) {
    const corsHeaders = getCorsHeaders();
    return { ...securityHeaders, ...corsHeaders };
  }
  return securityHeaders;
}

export function addRateLimitHeaders(
  headers: Headers,
  rateLimitInfo?: { limit: number; remaining: number; retryAfter?: number }
): void {
  if (!rateLimitInfo) return;
  headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
  const resetTime = Math.floor(Date.now() / 1000) + 3600;
  headers.set('X-RateLimit-Reset', resetTime.toString());
  if (rateLimitInfo.retryAfter) {
    headers.set('Retry-After', rateLimitInfo.retryAfter.toString());
  }
}
