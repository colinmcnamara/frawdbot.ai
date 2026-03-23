/**
 * frawdbot.get_threat_types
 * Returns the types of threats FrawdBot detects
 */

import type { SkillHandler } from '../types';
import { threatTypes } from '../../../../data/threats';

export const getThreatTypesHandler: SkillHandler = async () => {
  return {
    threat_types: threatTypes.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      severity: t.severity,
      category: t.category,
    })),
    total: threatTypes.length,
    categories: {
      ai_accelerated: threatTypes.filter(t => t.category === 'ai_accelerated').length,
      agent_drift: threatTypes.filter(t => t.category === 'agent_drift').length,
      traditional: threatTypes.filter(t => t.category === 'traditional').length,
    },
  };
};
