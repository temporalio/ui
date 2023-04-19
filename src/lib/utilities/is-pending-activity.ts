import { has } from './has';
import type { PendingActivity } from '$lib/types/events';

export const isPendingActivity = (event: unknown): event is PendingActivity => {
  if (event === null) return false;
  if (typeof event !== 'object') return false;
  if (Array.isArray(event)) return false;
  if (has(event, 'activityType')) return true;
  return false;
};
