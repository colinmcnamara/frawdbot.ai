/**
 * A2A Authentication Middleware
 */

import type { A2AConfig } from '../core/config';

export interface AuthResult {
  authenticated: boolean;
  reason?: string;
  client?: string;
}

export async function authenticateRequest(
  request: Request,
  config: A2AConfig
): Promise<AuthResult> {
  if (!config.authEnabled) return { authenticated: true };

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return { authenticated: false, reason: 'Missing Authorization header' };

  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!bearerMatch) return { authenticated: false, reason: 'Invalid Authorization format. Expected: Bearer <token>' };

  const token = bearerMatch[1];
  if (!config.apiKeys.includes(token)) return { authenticated: false, reason: 'Invalid API key' };

  return { authenticated: true, client: hashApiKey(token) };
}

function hashApiKey(key: string): string {
  if (key.length <= 8) return 'key_****';
  return `key_${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
}
