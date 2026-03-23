/**
 * Email Templates for FrawdBot A2A Engagement Submissions
 * Cyberpunk terminal aesthetic: dark bg (#0d1117), green accent (#2ecc71), orange (#e67e22)
 */

interface EngagementParams {
  contact: {
    name: string;
    email: string;
    company?: string;
    role?: string;
  };
  interest: {
    platform: string;
    description: string;
    urgency?: string;
    workspace_size?: string;
  };
  engagement_type: string;
  conversation_summary?: string;
  referenced_capabilities?: string[];
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Notification email sent to Colin with all lead details
 */
export function engagementNotificationHtml(
  params: EngagementParams,
  submissionId: string,
): string {
  const urgencyColors: Record<string, string> = {
    low: '#484f58',
    medium: '#e67e22',
    high: '#e74c3c',
    critical: '#c0392b',
  };
  const urgency = params.interest.urgency || 'medium';
  const urgencyColor = urgencyColors[urgency] || urgencyColors.medium;

  const companyLine = params.contact.company
    ? `<tr><td style="padding:6px 0;font-size:13px;color:#7d8590;">Company</td><td style="padding:6px 0;font-size:14px;color:#e6edf3;">${escapeHtml(params.contact.company)}</td></tr>`
    : '';
  const roleLine = params.contact.role
    ? `<tr><td style="padding:6px 0;font-size:13px;color:#7d8590;">Role</td><td style="padding:6px 0;font-size:14px;color:#e6edf3;">${escapeHtml(params.contact.role)}</td></tr>`
    : '';
  const workspaceLine = params.interest.workspace_size
    ? `<tr><td style="padding:6px 0;font-size:13px;color:#7d8590;">Workspace Size</td><td style="padding:6px 0;font-size:14px;color:#e6edf3;">${escapeHtml(params.interest.workspace_size)}</td></tr>`
    : '';
  const summarySection = params.conversation_summary
    ? `<tr><td colspan="2" style="padding:16px 0 4px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#2ecc71;margin-bottom:8px;">Conversation Summary</div>
        <div style="font-size:13px;color:#7d8590;line-height:1.6;padding:12px 16px;background:#0d1117;border:1px solid #21262d;border-radius:6px;">${escapeHtml(params.conversation_summary)}</div>
      </td></tr>`
    : '';
  const capsSection =
    params.referenced_capabilities && params.referenced_capabilities.length > 0
      ? `<tr><td colspan="2" style="padding:16px 0 4px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#2ecc71;margin-bottom:8px;">Referenced Capabilities</div>
        <div style="font-size:13px;color:#e6edf3;">${params.referenced_capabilities.map(escapeHtml).join(', ')}</div>
      </td></tr>`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;border:1px solid #21262d;">

<!-- Header -->
<tr><td style="padding:40px 40px 24px;">
  <div style="font-size:24px;font-weight:700;color:#2ecc71;letter-spacing:-0.5px;font-family:'JetBrains Mono',monospace;">FrawdBot.ai</div>
  <div style="font-size:13px;color:#7d8590;margin-top:4px;">A2A Lead Notification</div>
</td></tr>

<!-- Urgency Badge -->
<tr><td style="padding:0 40px 16px;">
  <span style="display:inline-block;padding:4px 12px;border-radius:4px;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:#0d1117;background:${urgencyColor};">${urgency} urgency</span>
  <span style="font-size:12px;color:#484f58;margin-left:12px;">ID: ${submissionId}</span>
</td></tr>

<!-- Contact Details -->
<tr><td style="padding:0 40px 24px;">
  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#e67e22;margin-bottom:12px;">Contact</div>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:6px 0;font-size:13px;color:#7d8590;width:120px;">Name</td><td style="padding:6px 0;font-size:14px;color:#e6edf3;">${escapeHtml(params.contact.name)}</td></tr>
    <tr><td style="padding:6px 0;font-size:13px;color:#7d8590;">Email</td><td style="padding:6px 0;font-size:14px;color:#e6edf3;"><a href="mailto:${escapeHtml(params.contact.email)}" style="color:#2ecc71;text-decoration:none;">${escapeHtml(params.contact.email)}</a></td></tr>
    ${companyLine}
    ${roleLine}
  </table>
</td></tr>

<!-- Interest Details -->
<tr><td style="padding:0 40px 24px;">
  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#e67e22;margin-bottom:12px;">Interest</div>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:6px 0;font-size:13px;color:#7d8590;width:120px;">Platform</td><td style="padding:6px 0;font-size:14px;color:#e6edf3;">${escapeHtml(params.interest.platform)}</td></tr>
    <tr><td style="padding:6px 0;font-size:13px;color:#7d8590;">Engagement</td><td style="padding:6px 0;font-size:14px;color:#e6edf3;">${escapeHtml(params.engagement_type)}</td></tr>
    ${workspaceLine}
    <tr><td colspan="2" style="padding:12px 0 4px;">
      <div style="font-size:13px;color:#7d8590;line-height:1.6;padding:12px 16px;background:#0d1117;border:1px solid #21262d;border-radius:6px;">${escapeHtml(params.interest.description)}</div>
    </td></tr>
    ${summarySection}
    ${capsSection}
  </table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px 32px;border-top:1px solid #21262d;">
  <p style="font-size:12px;color:#484f58;line-height:1.5;margin:0;">
    Source: A2A Agent Protocol<br>
    Submitted: ${new Date().toISOString()}
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/**
 * Confirmation email sent to the prospect
 */
export function engagementConfirmationHtml(params: EngagementParams): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;border:1px solid #21262d;">

<!-- Header -->
<tr><td style="padding:40px 40px 24px;">
  <div style="font-size:24px;font-weight:700;color:#2ecc71;letter-spacing:-0.5px;font-family:'JetBrains Mono',monospace;">FrawdBot.ai</div>
  <div style="font-size:13px;color:#7d8590;margin-top:4px;">Insider Threat Detection for Google Workspace</div>
</td></tr>

<!-- Main -->
<tr><td style="padding:0 40px 32px;">
  <h1 style="font-size:22px;color:#e6edf3;margin:0 0 12px;font-weight:600;">Your inquiry has been received</h1>
  <p style="font-size:15px;color:#7d8590;line-height:1.6;margin:0 0 24px;">
    Hi ${escapeHtml(params.contact.name)},
  </p>
  <p style="font-size:15px;color:#7d8590;line-height:1.6;margin:0 0 24px;">
    Thank you for your interest in FrawdBot's <strong style="color:#e6edf3;">${escapeHtml(params.interest.platform)}</strong> insider threat detection. I've received your details and will review them personally.
  </p>

  <!-- What You Shared -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td style="background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#e67e22;margin-bottom:12px;">Your Inquiry</div>
      <div style="font-size:14px;color:#e6edf3;line-height:1.6;">
        <strong>Platform:</strong> ${escapeHtml(params.interest.platform)}<br>
        <strong>Engagement:</strong> ${escapeHtml(params.engagement_type)}<br>
        ${params.interest.urgency ? `<strong>Urgency:</strong> ${escapeHtml(params.interest.urgency)}<br>` : ''}
        ${params.interest.workspace_size ? `<strong>Workspace size:</strong> ${escapeHtml(params.interest.workspace_size)}<br>` : ''}
      </div>
    </td></tr>
  </table>

  <!-- Next Steps -->
  <p style="font-size:15px;color:#7d8590;line-height:1.6;margin:0 0 24px;">
    The fastest way to move forward is to schedule a free 30-minute consultation. I'll come prepared with initial thoughts on how FrawdBot's detection engine applies to your environment.
  </p>

  <!-- CTA -->
  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td style="background:#2ecc71;border-radius:6px;">
      <a href="https://calendly.com/colin-mcnamara/acquit-ai-consultation" style="display:inline-block;padding:12px 28px;font-size:14px;color:#0d1117;text-decoration:none;font-weight:600;">Schedule a Consultation</a>
    </td></tr>
  </table>

  <p style="font-size:14px;color:#7d8590;line-height:1.6;margin:0;">
    Or reply directly to this email &mdash; I read every one.
  </p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px 32px;border-top:1px solid #21262d;">
  <p style="font-size:12px;color:#484f58;line-height:1.5;margin:0;">
    Colin McNamara / FrawdBot.ai<br>
    Insider Threat Detection for Google Workspace<br>
    <a href="https://frawdbot.ai" style="color:#484f58;">frawdbot.ai</a> &middot; <a href="https://acquit.ai" style="color:#484f58;">acquit.ai</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
