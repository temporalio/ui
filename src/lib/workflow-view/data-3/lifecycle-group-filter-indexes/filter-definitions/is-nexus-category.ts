import type { EventType } from '$lib/types/events';

import type { LifecycleGroupFilterDefinition } from '../types';
import { getEventTypeMatcher } from './matchers/event-type';

const nexusCategoryEventTypes = new Set<EventType>([
  'NexusOperationScheduled',
  'NexusOperationStarted',
  'NexusOperationCompleted',
  'NexusOperationFailed',
  'NexusOperationCanceled',
  'NexusOperationTimedOut',
  'NexusOperationCancelRequested',
  'NexusOperationCancelRequestCompleted',
  'NexusOperationCancelRequestFailed',
]);

export const isNexusCategory: LifecycleGroupFilterDefinition = {
  key: 'category:nexus',
  matches: getEventTypeMatcher(nexusCategoryEventTypes),
};
