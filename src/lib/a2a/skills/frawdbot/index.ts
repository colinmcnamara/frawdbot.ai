/**
 * FrawdBot Skill Registration
 * Registers all frawdbot.* and system.* skill handlers with the router.
 */

import { skillRouter } from '../router';
import { getCapabilitiesHandler } from './get-capabilities';
import { listPlatformsHandler } from './list-platforms';
import { getThreatTypesHandler } from './get-threats';
import { searchHandler } from './search';
import { submitEngagementHandler } from './submit-engagement';

// ---------------------------------------------------------------------------
// System skills
// ---------------------------------------------------------------------------

skillRouter.register('system', 'ping', async (params) => ({
  pong: true,
  timestamp: new Date().toISOString(),
  echo: params.message || null,
}));

skillRouter.register('system', 'info', async () => ({
  service: 'FrawdBot A2A Agent',
  version: '1.0.0',
  skills: skillRouter.getMethods(),
  namespaces: skillRouter.getNamespaces(),
}));

// ---------------------------------------------------------------------------
// FrawdBot skills
// ---------------------------------------------------------------------------

skillRouter.register('frawdbot', 'get_capabilities', getCapabilitiesHandler);
skillRouter.register('frawdbot', 'list_platforms', listPlatformsHandler);
skillRouter.register('frawdbot', 'get_threat_types', getThreatTypesHandler);
skillRouter.register('frawdbot', 'search', searchHandler);
skillRouter.register('frawdbot', 'submit_engagement', submitEngagementHandler);
