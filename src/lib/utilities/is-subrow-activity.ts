import { has } from './has';
import type { IterableEvent } from 'src/types/events';

export const isSubrowActivity = (event: IterableEvent): boolean => {
  return has(event?.attributes, 'workflowTaskCompletedEventId');
};
