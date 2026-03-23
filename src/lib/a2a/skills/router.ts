/**
 * A2A Skill Router
 */

import type { JsonRpcRequest } from '../types';
import { JsonRpcErrorCode } from '../types';
import { extractNamespace, extractMethodName } from '../core/validator';
import { validateAndSanitizeParams, shouldValidateParams } from '../core/param-validator';
import type { SkillHandler } from './types';

export class SkillRouter {
  private handlers = new Map<string, SkillHandler>();
  private namespaces = new Map<string, Set<string>>();

  register(namespace: string, method: string, handler: SkillHandler): void {
    const fullMethod = `${namespace}.${method}`;
    this.handlers.set(fullMethod, handler);

    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(namespace, new Set());
    }
    this.namespaces.get(namespace)!.add(method);
  }

  registerNamespace(namespace: string, handlers: Record<string, SkillHandler>): void {
    for (const [method, handler] of Object.entries(handlers)) {
      this.register(namespace, method, handler);
    }
  }

  async handle(request: JsonRpcRequest, log: any): Promise<any> {
    const { method } = request;

    const handler = this.handlers.get(method);
    if (!handler) {
      log.warn('Method not found', { method });
      throw {
        code: JsonRpcErrorCode.METHOD_NOT_FOUND,
        message: 'Method not found',
        data: `Unknown method: ${method}`,
      };
    }

    const namespace = extractNamespace(method);
    const methodName = extractMethodName(method);

    log.debug('Routing to skill handler', { namespace, methodName });

    try {
      let validatedParams = request.params || {};

      if (shouldValidateParams(method)) {
        log.debug('Validating parameters', { method });
        validatedParams = validateAndSanitizeParams(request);
        log.debug('Parameters validated successfully', { method });
      }

      const result = await handler(validatedParams, { request, log });

      log.debug('Skill handler completed successfully', { namespace, methodName });
      return result;
    } catch (error: any) {
      log.error('Skill handler error', error, { namespace, methodName });

      if (error.code && error.message) throw error;

      throw {
        code: JsonRpcErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
        data: error.message || 'Unknown error in skill handler',
      };
    }
  }

  getMethods(): string[] {
    return Array.from(this.handlers.keys()).sort();
  }

  getNamespaceMethods(namespace: string): string[] {
    const methods = this.namespaces.get(namespace);
    return methods ? Array.from(methods).sort() : [];
  }

  hasMethod(method: string): boolean {
    return this.handlers.has(method);
  }

  getNamespaces(): string[] {
    return Array.from(this.namespaces.keys()).sort();
  }
}

export const skillRouter = new SkillRouter();
