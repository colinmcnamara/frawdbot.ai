/**
 * frawdbot.submit_engagement
 * Conversion endpoint: captures lead, sends notification to Colin
 * and confirmation to prospect.
 */

import type { SkillHandler } from '../types';
import { Resend } from 'resend';
import {
  engagementNotificationHtml,
  engagementConfirmationHtml,
} from './email-templates';

const recentSubmissions = new Map<string, number>();
const recentEmails = new Set<string>();

export const submitEngagementHandler: SkillHandler = async (
  params,
  context,
) => {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    throw { code: -32603, message: 'Service not configured' };
  }

  const httpReq = (context as any).httpRequest as
    | { headers: { get(name: string): string | null } }
    | undefined;
  const ip =
    httpReq?.headers?.get?.('x-forwarded-for') ||
    httpReq?.headers?.get?.('cf-connecting-ip') ||
    'unknown';
  const lastSubmission = recentSubmissions.get(ip);
  if (lastSubmission && Date.now() - lastSubmission < 60000) {
    throw {
      code: -32004,
      message: 'Rate limit exceeded',
      data: 'Please wait 60 seconds between submissions',
    };
  }

  if (recentEmails.has(params.contact.email)) {
    return {
      submission_id: crypto.randomUUID(),
      status: 'already_submitted',
      next_steps: {
        calendly_url: 'https://calendly.com/colin-mcnamara/acquit-ai-consultation',
        confirmation_sent: false,
        message: 'A confirmation was already sent to this email.',
      },
    };
  }

  const resend = new Resend(apiKey);
  const submissionId = crypto.randomUUID();

  // Create contact
  await resend.contacts
    .create({
      email: params.contact.email,
      unsubscribed: false,
      properties: {
        source: 'a2a-frawdbot',
        name: params.contact.name,
        company: params.contact.company || '',
        role: params.contact.role || '',
        platform: params.interest.platform,
        urgency: params.interest.urgency || 'medium',
        engagement_type: params.engagement_type,
        submission_id: submissionId,
        submitted_at: new Date().toISOString(),
      },
    })
    .catch((err: unknown) => console.error('Contact creation error:', err));

  // Send Colin notification to BOTH addresses
  await resend.emails
    .send({
      from: 'FrawdBot A2A <colin@acquit.ai>',
      to: ['colin@acquit.ai', 'colin@2cups.com'],
      subject: `[FrawdBot Lead] ${params.contact.name}${params.contact.company ? ' from ' + params.contact.company : ''} — ${params.interest.platform} (${params.interest.urgency || 'medium'})`,
      html: engagementNotificationHtml(params, submissionId),
    })
    .catch((err: unknown) => console.error('Notification email error:', err));

  // Send prospect confirmation
  await resend.emails
    .send({
      from: 'Colin McNamara <colin@acquit.ai>',
      to: params.contact.email,
      subject: 'Your inquiry has been received — FrawdBot.ai',
      html: engagementConfirmationHtml(params),
    })
    .catch((err: unknown) => console.error('Confirmation email error:', err));

  // Track for dedup
  recentSubmissions.set(ip, Date.now());
  recentEmails.add(params.contact.email);

  if (recentEmails.size > 100) {
    const first = recentEmails.values().next().value;
    if (first) recentEmails.delete(first);
  }

  return {
    submission_id: submissionId,
    status: 'submitted',
    next_steps: {
      calendly_url: 'https://calendly.com/colin-mcnamara/acquit-ai-consultation',
      confirmation_sent: true,
    },
  };
};
