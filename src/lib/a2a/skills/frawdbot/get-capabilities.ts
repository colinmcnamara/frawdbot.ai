/**
 * frawdbot.get_capabilities
 * Returns FrawdBot detection capabilities, optionally filtered by category
 */

import type { SkillHandler } from '../types';
import { capabilities, getCapabilitiesByCategory } from '../../../../data/capabilities';

export const getCapabilitiesHandler: SkillHandler = async (params) => {
  const filtered = getCapabilitiesByCategory(params.category);

  return {
    capabilities: filtered.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      category: c.category,
    })),
    total: filtered.length,
    categories: [...new Set(capabilities.map(c => c.category))],
  };
};
