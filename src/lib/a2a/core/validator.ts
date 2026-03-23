/**
 * JSON-RPC 2.0 Validator
 */

import type { JsonRpcRequest, JsonRpcError } from '../types';
import { A2A_ERRORS, JsonRpcErrorCode } from '../types';

export interface ValidationResult {
  valid: boolean;
  error?: JsonRpcError;
}

export function validateJsonRpc(request: any): ValidationResult {
  if (!request || typeof request !== 'object') {
    return { valid: false, error: A2A_ERRORS.INVALID_REQUEST };
  }

  if (request.jsonrpc !== '2.0') {
    return {
      valid: false,
      error: {
        code: JsonRpcErrorCode.INVALID_REQUEST,
        message: 'Invalid Request',
        data: 'Missing or invalid jsonrpc version. Must be "2.0"',
      },
    };
  }

  if (typeof request.method !== 'string' || request.method.length === 0) {
    return {
      valid: false,
      error: {
        code: JsonRpcErrorCode.INVALID_REQUEST,
        message: 'Invalid Request',
        data: 'Missing or invalid method',
      },
    };
  }

  if (request.method.startsWith('rpc.')) {
    return {
      valid: false,
      error: {
        code: JsonRpcErrorCode.METHOD_NOT_FOUND,
        message: 'Method not found',
        data: 'System methods are not supported',
      },
    };
  }

  if ('id' in request) {
    const idType = typeof request.id;
    if (request.id !== null && idType !== 'string' && idType !== 'number') {
      return {
        valid: false,
        error: {
          code: JsonRpcErrorCode.INVALID_REQUEST,
          message: 'Invalid Request',
          data: 'Invalid id type. Must be string, number, or null',
        },
      };
    }
  }

  if ('params' in request) {
    const paramsType = typeof request.params;
    if (request.params !== null && paramsType !== 'object') {
      return {
        valid: false,
        error: {
          code: JsonRpcErrorCode.INVALID_REQUEST,
          message: 'Invalid Request',
          data: 'Invalid params type. Must be object or array',
        },
      };
    }
  }

  return { valid: true };
}

export function isNotification(request: JsonRpcRequest): boolean {
  return !('id' in request) || request.id === null || request.id === undefined;
}

export function validateMethodName(method: string): boolean {
  const methodPattern = /^[a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z][a-zA-Z0-9_]*$/;
  return methodPattern.test(method);
}

export function extractNamespace(method: string): string {
  const parts = method.split('.');
  return parts[0] || '';
}

export function extractMethodName(method: string): string {
  const parts = method.split('.');
  return parts.slice(1).join('.');
}
