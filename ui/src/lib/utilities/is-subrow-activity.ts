import { has } from './has';

export const isSubrowActivity = (event: IterableEvent): boolean => {
  return has(event?.attributes, 'workflowTaskCompletedEventId');
};
