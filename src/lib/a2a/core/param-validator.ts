/**
 * Parameter Validator for A2A Skills
 */

import { validateMethodParams, sanitizeString } from '../validation/schemas';
import { JsonRpcErrorCode } from '../types';
import type { JsonRpcRequest } from '../types';

export function validateAndSanitizeParams(request: JsonRpcRequest): any {
  const { method, params } = request;

  const validation = validateMethodParams(method, params);

  if (!validation.success) {
    throw {
      code: JsonRpcErrorCode.INVALID_PARAMS,
      message: 'Invalid params',
      data: validation.error,
    };
  }

  const sanitized = sanitizeObjectStrings(validation.data);
  return sanitized;
}

function sanitizeObjectStrings(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map(item => sanitizeObjectStrings(item));
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectStrings(value);
    }
    return sanitized;
  }
  return obj;
}

export function shouldValidateParams(method: string): boolean {
  if (method.startsWith('frawdbot.')) return true;
  return false;
}
