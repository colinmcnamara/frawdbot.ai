/**
 * A2A Error Type Definitions
 * Standard JSON-RPC 2.0 error codes and custom A2A errors
 */

import type { JsonRpcError } from './protocol';

/**
 * Standard JSON-RPC 2.0 error codes
 */
export enum JsonRpcErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  SERVER_ERROR_START = -32000,
  SERVER_ERROR_END = -32099,
}

/**
 * Custom A2A error codes (within server error range)
 */
export enum A2AErrorCode {
  AUTH_REQUIRED = -32001,
  AUTH_INVALID = -32002,
  AUTH_INSUFFICIENT = -32003,
  RATE_LIMIT_EXCEEDED = -32004,
  RESOURCE_NOT_FOUND = -32005,
  TIMEOUT = -32006,
  INVALID_FORMAT = -32007,
  SKILL_EXECUTION_ERROR = -32008,
  STREAMING_NOT_SUPPORTED = -32009,
  TASK_NOT_FOUND = -32010,
  TASK_ALREADY_CANCELLED = -32011,
}

/**
 * Predefined A2A errors
 */
export const A2A_ERRORS: Record<string, JsonRpcError> = {
  PARSE_ERROR: {
    code: JsonRpcErrorCode.PARSE_ERROR,
    message: 'Parse error',
    data: 'Invalid JSON was received by the server',
  },
  INVALID_REQUEST: {
    code: JsonRpcErrorCode.INVALID_REQUEST,
    message: 'Invalid Request',
    data: 'The JSON sent is not a valid Request object',
  },
  METHOD_NOT_FOUND: {
    code: JsonRpcErrorCode.METHOD_NOT_FOUND,
    message: 'Method not found',
    data: 'The method does not exist or is not available',
  },
  INVALID_PARAMS: {
    code: JsonRpcErrorCode.INVALID_PARAMS,
    message: 'Invalid params',
    data: 'Invalid method parameter(s)',
  },
  INTERNAL_ERROR: {
    code: JsonRpcErrorCode.INTERNAL_ERROR,
    message: 'Internal error',
    data: 'Internal JSON-RPC error',
  },
  AUTH_REQUIRED: {
    code: A2AErrorCode.AUTH_REQUIRED,
    message: 'Authentication required',
    data: 'This endpoint requires authentication',
  },
  AUTH_INVALID: {
    code: A2AErrorCode.AUTH_INVALID,
    message: 'Invalid authentication',
    data: 'The provided authentication credentials are invalid',
  },
  RATE_LIMIT_EXCEEDED: {
    code: A2AErrorCode.RATE_LIMIT_EXCEEDED,
    message: 'Rate limit exceeded',
    data: 'Too many requests. Please try again later',
  },
  RESOURCE_NOT_FOUND: {
    code: A2AErrorCode.RESOURCE_NOT_FOUND,
    message: 'Resource not found',
    data: 'The requested resource could not be found',
  },
};

/**
 * Error response builder
 */
export class A2AError extends Error implements JsonRpcError {
  code: number;
  data?: any;

  constructor(error: JsonRpcError) {
    super(error.message);
    this.name = 'A2AError';
    this.code = error.code;
    this.data = error.data;
  }

  static fromType(type: keyof typeof A2A_ERRORS, data?: any): A2AError {
    const error = A2A_ERRORS[type];
    return new A2AError({ ...error, data: data || error.data });
  }

  static custom(code: number, message: string, data?: any): A2AError {
    return new A2AError({ code, message, data });
  }

  toJSON(): JsonRpcError {
    return { code: this.code, message: this.message, data: this.data };
  }
}

export function isA2AError(error: any): error is A2AError {
  return error instanceof A2AError ||
    (error && typeof error.code === 'number' && typeof error.message === 'string');
}

export function toJsonRpcError(error: any): JsonRpcError {
  if (isA2AError(error)) return error.toJSON();
  if (error instanceof Error) {
    return { code: JsonRpcErrorCode.INTERNAL_ERROR, message: 'Internal error', data: error.message };
  }
  return A2A_ERRORS.INTERNAL_ERROR;
}
