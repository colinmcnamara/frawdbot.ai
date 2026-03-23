/**
 * A2A Configuration Management
 * FrawdBot-specific configuration
 */

export interface A2AConfig {
  agentName: string;
  agentVersion: string;
  agentDescription: string;
  authEnabled: boolean;
  apiKeys: string[];
  rateLimitRequests: number;
  rateLimitWindow: number;
  streamingEnabled: boolean;
  webfingerEnabled: boolean;
  baseUrl: string;
  debug: boolean;
  instanceId?: string;
  allowedOrigins?: string[];
}

export function getA2AConfig(): A2AConfig {
  return {
    agentName: process.env.A2A_AGENT_NAME || 'FrawdBot Agent',
    agentVersion: process.env.A2A_AGENT_VERSION || '1.0.0',
    agentDescription: process.env.A2A_AGENT_DESCRIPTION ||
      'Insider threat detection for Google Workspace. Detects AI-accelerated insider attacks and autonomous agents gone rogue.',

    authEnabled: process.env.A2A_AUTH_ENABLED === 'true',
    apiKeys: process.env.A2A_API_KEYS
      ? process.env.A2A_API_KEYS.split(',').map(k => k.trim()).filter(Boolean)
      : [],

    rateLimitRequests: parseInt(process.env.A2A_RATE_LIMIT_REQUESTS || '60', 10),
    rateLimitWindow: parseInt(process.env.A2A_RATE_LIMIT_WINDOW || '60000', 10),

    streamingEnabled: process.env.A2A_STREAMING_ENABLED !== 'false',
    webfingerEnabled: process.env.A2A_WEBFINGER_ENABLED !== 'false',

    baseUrl: process.env.PUBLIC_BASE_URL || 'https://frawdbot.ai',

    debug: process.env.A2A_DEBUG === 'true',
    instanceId: process.env.A2A_INSTANCE_ID,

    allowedOrigins: process.env.A2A_ALLOWED_ORIGINS
      ? process.env.A2A_ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
      : undefined,
  };
}

export function validateConfig(config: A2AConfig): string[] {
  const errors: string[] = [];
  if (!config.agentName) errors.push('Agent name is required');
  if (!config.agentVersion) errors.push('Agent version is required');
  if (config.authEnabled && config.apiKeys.length === 0) {
    errors.push('Authentication is enabled but no API keys are configured');
  }
  if (config.rateLimitRequests <= 0) errors.push('Rate limit requests must be greater than 0');
  if (config.rateLimitWindow <= 0) errors.push('Rate limit window must be greater than 0');
  return errors;
}

export function getEnvironmentConfig(): {
  isDevelopment: boolean;
  isProduction: boolean;
  isPreview: boolean;
} {
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || 'development';
  return {
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isPreview: env === 'preview',
  };
}
