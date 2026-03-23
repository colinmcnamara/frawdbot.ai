/**
 * Shared endpoint handler for individual A2A method endpoints
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
} from './index';
import type { JsonRpcRequest } from '../types';
import { skillRouter } from '../skills';
import { authenticateRequest } from '../middleware/auth';
import { rateLimitRequest } from '../middleware/rate-limit';
import { createRequestTracker, trackAgentSession, trackRateLimit } from '../monitoring/metrics';

export function createMethodHandler(method: string): {
  POST: APIRoute;
  OPTIONS: APIRoute;
  GET: APIRoute;
} {
  const POST: APIRoute = async ({ request }) => {
    const config = getA2AConfig();
    const requestId = crypto.randomUUID();
    const log = logger.child({ requestId, method });

    try {
      let body: any;
      try {
        const text = await request.text();
        if (!text) {
          log.warn('Empty request body');
          return jsonRpcCorsResponse(createErrorResponse(A2A_ERRORS.PARSE_ERROR, null), 400);
        }
        body = JSON.parse(text);
      } catch (error) {
        log.error('Failed to parse request body', error);
        return jsonRpcCorsResponse(createErrorResponse(A2A_ERRORS.PARSE_ERROR, null), 400);
      }

      if (!body.method) body.method = method;

      const validation = validateJsonRpc(body);
      if (!validation.valid) {
        log.warn('Invalid JSON-RPC request', { error: validation.error });
        return jsonRpcCorsResponse(createErrorResponse(validation.error!, body?.id || null), 400);
      }

      const jsonRpcRequest = body as JsonRpcRequest;
      jsonRpcRequest.method = method;

      const isNotification = !('id' in jsonRpcRequest) || jsonRpcRequest.id === null;

      log.info('Processing request', { isNotification, hasParams: !!jsonRpcRequest.params });

      const agentId = request.headers.get('x-agent-id') ||
                     request.headers.get('user-agent') || 'anonymous';
      trackAgentSession('start', agentId);

      const tracker = createRequestTracker(method);

      try {
        if (config.authEnabled) {
          const authResult = await authenticateRequest(request, config);
          if (!authResult.authenticated) {
            log.warn('Authentication failed', { reason: authResult.reason });
            if (!isNotification) {
              return jsonRpcCorsResponse(
                createErrorResponse({ code: JsonRpcErrorCode.INVALID_REQUEST, message: 'Authentication required', data: authResult.reason }, jsonRpcRequest.id),
                401
              );
            }
            return new Response(null, { status: 204 });
          }
        }

        const rateLimitResult = await rateLimitRequest(request, config);
        trackRateLimit(method, agentId, rateLimitResult.remaining, rateLimitResult.limit);

        if (!rateLimitResult.allowed) {
          log.warn('Rate limit exceeded', { retryAfter: rateLimitResult.retryAfter, remaining: rateLimitResult.remaining });
          tracker.setError(new Error('Rate limit exceeded'));
          trackAgentSession('end', agentId);
          if (!isNotification) {
            return jsonRpcResponseWithRateLimit(
              createErrorResponse({ code: JsonRpcErrorCode.INVALID_REQUEST, message: 'Rate limit exceeded', data: { retryAfter: rateLimitResult.retryAfter, limit: rateLimitResult.limit, remaining: rateLimitResult.remaining } }, jsonRpcRequest.id),
              rateLimitResult
            );
          }
          return new Response(null, { status: 204 });
        }

        const result = await skillRouter.handle(jsonRpcRequest, log);
        tracker.setResult(true, result);
        trackAgentSession('end', agentId);

        if (isNotification) return new Response(null, { status: 204 });

        return jsonRpcCachedResponse(request, jsonRpcRequest, createSuccessResponse(result, jsonRpcRequest.id!), rateLimitResult, DEFAULT_CACHE_CONFIG);
      } catch (error: any) {
        log.error('Error processing request', error);
        tracker.setError(error);
        trackAgentSession('end', agentId);

        if (isNotification) return new Response(null, { status: 204 });

        if (error.code && error.message) {
          return jsonRpcCorsResponse(createErrorResponse(error, jsonRpcRequest.id), 200);
        }

        return jsonRpcCorsResponse(
          createErrorResponse({ code: JsonRpcErrorCode.INTERNAL_ERROR, message: 'Internal server error', data: config.debug ? error.message : undefined }, jsonRpcRequest.id),
          500
        );
      }
    } catch (error) {
      log.error('Unexpected error in service endpoint', error);
      return jsonRpcCorsResponse(createErrorResponse(A2A_ERRORS.INTERNAL_ERROR, null), 500);
    }
  };

  const OPTIONS: APIRoute = async () => corsPreflightResponse();

  const GET: APIRoute = async ({ url }) => {
    const endpoint = url.pathname;
    return new Response(JSON.stringify({
      method,
      endpoint,
      protocol: 'JSON-RPC 2.0',
      description: `Direct endpoint for ${method} method`,
      usage: 'POST a JSON-RPC 2.0 request without the method field',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  };

  return { POST, OPTIONS, GET };
}

export const prerender = false;
