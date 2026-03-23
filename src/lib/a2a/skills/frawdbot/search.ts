/**
 * frawdbot.search
 * Search across capabilities and threat types
 */

import type { SkillHandler } from '../types';
import { capabilities } from '../../../../data/capabilities';
import { threatTypes } from '../../../../data/threats';
import { platforms } from '../../../../data/platforms';

export const searchHandler: SkillHandler = async (params) => {
  const query = params.query.toLowerCase();

  const matchedCapabilities = capabilities.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.description.toLowerCase().includes(query) ||
    c.id.toLowerCase().includes(query)
  );

  const matchedThreats = threatTypes.filter(t =>
    t.name.toLowerCase().includes(query) ||
    t.description.toLowerCase().includes(query) ||
    t.id.toLowerCase().includes(query)
  );

  const matchedPlatforms = platforms.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query) ||
    p.id.toLowerCase().includes(query)
  );

  const results: Array<{
    type: string;
    id: string;
    name: string;
    description: string;
    relevance: number;
  }> = [];

  for (const c of matchedCapabilities) {
    const nameMatch = c.name.toLowerCase().includes(query);
    results.push({
      type: 'capability',
      id: c.id,
      name: c.name,
      description: c.description,
      relevance: nameMatch ? 1.0 : 0.7,
    });
  }

  for (const t of matchedThreats) {
    const nameMatch = t.name.toLowerCase().includes(query);
    results.push({
      type: 'threat_type',
      id: t.id,
      name: t.name,
      description: t.description,
      relevance: nameMatch ? 1.0 : 0.7,
    });
  }

  for (const p of matchedPlatforms) {
    const nameMatch = p.name.toLowerCase().includes(query);
    results.push({
      type: 'platform',
      id: p.id,
      name: p.name,
      description: p.description,
      relevance: nameMatch ? 1.0 : 0.7,
    });
  }

  results.sort((a, b) => b.relevance - a.relevance);

  return {
    query: params.query,
    results,
    total: results.length,
  };
};
