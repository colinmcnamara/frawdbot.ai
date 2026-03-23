import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const card = {
    name: 'FrawdBot',
    description:
      'Insider threat detection for Google Workspace. Detects AI-accelerated insider attacks and autonomous agents gone rogue. 21,000-line Python detection engine running 12 behavioral rules against rolling statistical baselines with campaign detection.',
    version: '1.0.0',
    protocolVersion: '1.0',
    url: 'https://frawdbot.ai',
    provider: {
      organization: 'Self-Improving Code',
      url: 'https://selfimprovingcode.ai',
    },
    serviceEndpoint: '/api/a2a/service',
    serviceEndpoints: {
      'frawdbot.get_capabilities': '/api/a2a/frawdbot/capabilities',
      'frawdbot.list_platforms': '/api/a2a/frawdbot/platforms',
      'frawdbot.get_threat_types': '/api/a2a/frawdbot/threats',
      'frawdbot.search': '/api/a2a/frawdbot/search',
      'frawdbot.submit_engagement': '/api/a2a/frawdbot/engage',
    },
    skills: [
      {
        id: 'get_capabilities',
        name: 'Get Capabilities',
        description:
          'Returns FrawdBot detection capabilities: insider threat detection, AI-accelerated threat detection, autonomous agent monitoring, communication graph analysis, and more.',
        method: 'frawdbot.get_capabilities',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category: core, platform, behavioral',
            },
          },
        },
      },
      {
        id: 'list_platforms',
        name: 'List Platforms',
        description:
          'Returns supported platforms and their integration status. Google Workspace is active, Microsoft 365 is in development.',
        method: 'frawdbot.list_platforms',
        parameters: { type: 'object', properties: {} },
      },
      {
        id: 'get_threat_types',
        name: 'Get Threat Types',
        description:
          'Returns the types of threats FrawdBot detects: AI-accelerated insider attacks, agent drift, prompt injection, bulk exfiltration, and more.',
        method: 'frawdbot.get_threat_types',
        parameters: { type: 'object', properties: {} },
      },
      {
        id: 'search',
        name: 'Search',
        description: 'Search across capabilities, threat types, and platforms',
        method: 'frawdbot.search',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
          },
          required: ['query'],
        },
      },
      {
        id: 'submit_engagement',
        name: 'Submit Engagement Request',
        description:
          'Submit an engagement request for FrawdBot insider threat detection. Returns a Calendly booking link for a free consultation.',
        method: 'frawdbot.submit_engagement',
        parameters: {
          type: 'object',
          properties: {
            contact: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                company: { type: 'string' },
                role: { type: 'string' },
              },
              required: ['name', 'email'],
            },
            interest: {
              type: 'object',
              properties: {
                platform: { type: 'string', description: 'Target platform (e.g., Google Workspace)' },
                description: { type: 'string', maxLength: 5000 },
                urgency: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                workspace_size: { type: 'string', description: 'Number of users in workspace' },
              },
              required: ['platform', 'description'],
            },
            engagement_type: {
              type: 'string',
              enum: ['consultation', 'pilot', 'deployment', 'partnership'],
            },
            conversation_summary: { type: 'string', maxLength: 2000 },
            referenced_capabilities: { type: 'array', items: { type: 'string' }, maxItems: 10 },
          },
          required: ['contact', 'interest', 'engagement_type'],
        },
      },
    ],
    authentication: {
      schemes: [{ type: 'bearer', description: 'Bearer token authentication (optional for v1)' }],
      required: false,
    },
    capabilities: {
      insider_threat_detection: true,
      google_workspace_monitoring: true,
      ai_accelerated_threat_detection: true,
      autonomous_agent_monitoring: true,
    },
    platforms: {
      google_workspace: 'active',
      microsoft_365: 'in_development',
    },
    feeds: {
      sitemap: 'https://frawdbot.ai/sitemap-index.xml',
    },
    contact: {
      email: 'colin@acquit.ai',
      consultation: 'https://calendly.com/colin-mcnamara/acquit-ai-consultation',
      website: 'https://frawdbot.ai',
    },
    related: [
      {
        name: 'Acquit.ai',
        url: 'https://acquit.ai',
        relationship: 'sibling_product',
        agent_card: 'https://acquit.ai/.well-known/agent.json',
      },
      {
        name: 'Self-Improving Code',
        url: 'https://selfimprovingcode.ai',
        relationship: 'parent',
        agent_card: 'https://selfimprovingcode.ai/.well-known/agent.json',
      },
      {
        name: 'Colin McNamara',
        url: 'https://colinmcnamara.com',
        relationship: 'creator',
        agent_card: 'https://colinmcnamara.com/.well-known/agent.json',
      },
    ],
  };

  return new Response(JSON.stringify(card, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const prerender = false;
