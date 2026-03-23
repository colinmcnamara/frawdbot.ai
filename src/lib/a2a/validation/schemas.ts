/**
 * A2A Validation Schemas
 * Zod schemas for every frawdbot.* JSON-RPC method
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

export function sanitizeString(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Individual Method Schemas
// ---------------------------------------------------------------------------

const getCapabilitiesSchema = z.object({
  category: z.string().max(50).optional(),
});

const listPlatformsSchema = z.object({});

const getThreatTypesSchema = z.object({});

const searchSchema = z.object({
  query: z.string().min(1).max(200),
});

const submitEngagementSchema = z.object({
  contact: z.object({
    name: z.string().min(1).max(200),
    email: z.string().email(),
    company: z.string().max(200).optional(),
    role: z.string().max(200).optional(),
  }),
  interest: z.object({
    platform: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    workspace_size: z.string().max(100).optional(),
  }),
  engagement_type: z.enum([
    'consultation',
    'pilot',
    'deployment',
    'partnership',
  ]),
  conversation_summary: z.string().max(2000).optional(),
  referenced_capabilities: z
    .array(z.string().max(100))
    .max(10)
    .optional(),
});

// ---------------------------------------------------------------------------
// Method Schema Map
// ---------------------------------------------------------------------------

export const methodSchemas = new Map<string, z.ZodTypeAny>([
  ['frawdbot.get_capabilities', getCapabilitiesSchema],
  ['frawdbot.list_platforms', listPlatformsSchema],
  ['frawdbot.get_threat_types', getThreatTypesSchema],
  ['frawdbot.search', searchSchema],
  ['frawdbot.submit_engagement', submitEngagementSchema],
]);

// ---------------------------------------------------------------------------
// Validation Helper
// ---------------------------------------------------------------------------

export function validateMethodParams(
  method: string,
  params: unknown,
): { success: true; data: any } | { success: false; error: string } {
  const schema = methodSchemas.get(method);

  if (!schema) {
    return { success: true, data: params ?? {} };
  }

  const result = schema.safeParse(params ?? {});

  if (result.success) {
    return { success: true, data: result.data };
  }

  const issues = result.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('; ');

  return { success: false, error: issues };
}
