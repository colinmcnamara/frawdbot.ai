/**
 * A2A JSON-RPC 2.0 Service Endpoint
 * Main entry point for all FrawdBot A2A agent interactions
 */

import type { APIRoute } from 'astro';
import {
  validateJsonRpc,
  createErrorResponse,
  createSuccessResponse,
  jsonRpcCorsResponse,
  jsonRpcResponseWithRateLimit,
  jsonRpcCachedResponse,
  corsPreflightResponse,
  logger,
  getA2AConfig,
  A2A_ERRORS,
  JsonRpcErrorCode,
  DEFAULT_CACHE_CONFIG,
} from '../../../lib/a2a/core';
import type { JsonRpcRequest, JsonRpcResponse } from '../../../lib/a2a/types';
import { skillRouter } from '../../../lib/a2a/skills';
import { authenticateRequest } from '../../../lib/a2a/middleware/auth';
import { rateLimitRequest } from '../../../lib/a2a/middleware/rate-limit';
import { createRequestTracker, trackAgentSession, trackRateLimit } from '../../../lib/a2a/monitoring/metrics';

// Import skills to trigger registration
import '../../../lib/a2a/skills';

export const prerender = false;

const MAX_BODY_SIZE = 10240;

export const OPTIONS: APIRoute = async () => {
  return corsPreflightResponse();
};

export const POST: APIRoute = async ({ request }) => {
  const config = getA2AConfig();
  const requestId = crypto.randomUUID();
  const startTime = Date.now();
  const log = logger.child({ requestId });

  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      log.warn('Request body too large', { contentLength });
      return jsonRpcCorsResponse(
        createErrorResponse({ code: -32600, message: 'Request body too large (max 10KB)' }, null),
        413
      );
    }

    let body: any;
    let text: string = '';
    try {
      text = await request.text();
      if (!text) {
        log.warn('Empty request body');
        return jsonRpcCorsResponse(createErrorResponse(A2A_ERRORS.PARSE_ERROR, null), 400);
      }
      if (text.length > MAX_BODY_SIZE) {
        log.warn('Request body too large (post-read)', { size: text.length });
        return jsonRpcCorsResponse(
          createErrorResponse({ code: -32600, message: 'Request body too large (max 10KB)' }, null),
          413
        );
      }
      body = JSON.parse(text);
    } catch (error) {
      log.error('Failed to parse request body', error, { bodyText: text || 'Could not read body' });
      return jsonRpcCorsResponse(createErrorResponse(A2A_ERRORS.PARSE_ERROR, null), 400);
    }

    // Reject batch requests
    if (Array.isArray(body)) {
      return jsonRpcCorsResponse(
        createErrorResponse({ code: -32600, message: 'Batch requests not supported in v1' }, null),
        400
      );
    }

    const result = await processRequest(body, request, log, config);

    if (result.response === null) {
      return new Response(null, { status: 204 });
    }

    if (result.request) {
      return jsonRpcCachedResponse(
        request, result.request, result.response,
        result.rateLimitInfo, DEFAULT_CACHE_CONFIG
      );
    }

    return jsonRpcResponseWithRateLimit(result.response, result.rateLimitInfo);
  } catch (error) {
    log.error('Unexpected error in service endpoint', error);
    return jsonRpcCorsResponse(createErrorResponse(A2A_ERRORS.INTERNAL_ERROR, null), 500);
  } finally {
    const duration = Date.now() - startTime;
    log.info('Request completed', { duration });
  }
};

interface ProcessRequestResult {
  response: JsonRpcResponse | null;
  rateLimitInfo?: { limit: number; remaining: number; retryAfter?: number };
  request?: JsonRpcRequest;
}

async function processRequest(
  body: any,
  httpRequest: Request,
  log: any,
  config: any
): Promise<ProcessRequestResult> {
  const validation = validateJsonRpc(body);
  if (!validation.valid) {
    log.warn('Invalid JSON-RPC request', { error: validation.error });
    return { response: createErrorResponse(validation.error!, body?.id || null) };
  }

  const request = body as JsonRpcRequest;
  const isNotification = !('id' in request) || request.id === null;

  log.info('Processing request', {
    method: request.method,
    isNotification,
    hasParams: !!request.params,
  });

  const agentId =
    httpRequest.headers.get('x-agent-id') ||
    httpRequest.headers.get('user-agent') || 'anonymous';
  trackAgentSession('start', agentId);

  const tracker = createRequestTracker(request.method);

  try {
    if (config.authEnabled) {
      const authResult = await authenticateRequest(httpRequest, config);
      if (!authResult.authenticated) {
        log.warn('Authentication failed', { reason: authResult.reason });
        if (!isNotification) {
          return {
            response: createErrorResponse(
              { code: JsonRpcErrorCode.INVALID_REQUEST, message: 'Authentication required', data: authResult.reason },
              request.id
            ),
          };
        }
        return { response: null };
      }
    }

    const rateLimitResult = await rateLimitRequest(httpRequest, config);
    trackRateLimit(request.method, agentId, rateLimitResult.remaining, rateLimitResult.limit);

    if (!rateLimitResult.allowed) {
      log.warn('Rate limit exceeded', { retryAfter: rateLimitResult.retryAfter, remaining: rateLimitResult.remaining });
      tracker.setError(new Error('Rate limit exceeded'));
      trackAgentSession('end', agentId);
      if (!isNotification) {
        return {
          response: createErrorResponse(
            { code: JsonRpcErrorCode.INVALID_REQUEST, message: 'Rate limit exceeded', data: { retryAfter: rateLimitResult.retryAfter, limit: rateLimitResult.limit, remaining: rateLimitResult.remaining } },
            request.id
          ),
          rateLimitInfo: rateLimitResult,
        };
      }
      return { response: null, rateLimitInfo: rateLimitResult };
    }

    const rateLimitInfo = rateLimitResult;
    const result = await skillRouter.handle(request, log);

    tracker.setResult(true, result);
    trackAgentSession('end', agentId);

    if (isNotification) return { response: null, rateLimitInfo };

    return {
      response: createSuccessResponse(result, request.id!),
      rateLimitInfo,
      request,
    };
  } catch (error: any) {
    log.error('Error processing request', error, { method: request.method });
    tracker.setError(error);
    trackAgentSession('end', agentId);

    if (isNotification) return { response: null };

    if (error.code && error.message) {
      return { response: createErrorResponse(error, request.id) };
    }

    return {
      response: createErrorResponse(
        { code: JsonRpcErrorCode.INTERNAL_ERROR, message: 'Internal server error', data: config.debug ? error.message : undefined },
        request.id
      ),
    };
  }
}

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      service: 'FrawdBot A2A JSON-RPC 2.0 Service',
      version: '1.0.0',
      protocol: 'JSON-RPC 2.0',
      agentCard: 'https://frawdbot.ai/.well-known/agent.json',
      documentation: 'https://github.com/google-gemini/a2a-sdk',
      notes: {
        caching: 'To bypass edge caching, append a unique query parameter like ?_t=timestamp',
        batchRequests: 'Batch requests are not supported in v1.',
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    }
  );
};
