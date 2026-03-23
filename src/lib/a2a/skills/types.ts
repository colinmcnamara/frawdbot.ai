/**
 * A2A Skill Types
 */

import type { JsonRpcRequest } from '../types';

export interface SkillContext {
  request: JsonRpcRequest;
  log: any;
  [key: string]: any;
}

export type SkillHandler = (
  params: any,
  context: SkillContext
) => Promise<any> | any;

export interface SkillInfo {
  namespace: string;
  method: string;
  handler: SkillHandler;
  description?: string;
}
