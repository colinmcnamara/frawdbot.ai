/**
 * frawdbot.list_platforms
 * Returns supported platforms and their status
 */

import type { SkillHandler } from '../types';
import { platforms } from '../../../../data/platforms';

export const listPlatformsHandler: SkillHandler = async () => {
  return {
    platforms: platforms.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      description: p.description,
    })),
    total: platforms.length,
  };
};
