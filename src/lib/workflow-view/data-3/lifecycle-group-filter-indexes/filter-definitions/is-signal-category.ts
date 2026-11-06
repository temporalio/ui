import type { EventType } from '$lib/types/events';

import type { LifecycleGroupFilterDefinition } from '../types';
import { getEventTypeMatcher } from './matchers/event-type';

const signalCategoryEventTypes = new Set<EventType>([
  'SignalExternalWorkflowExecutionFailed',
  'SignalExternalWorkflowExecutionInitiated',
  'WorkflowExecutionSignaled',
  'ExternalWorkflowExecutionSignaled',
]);

export const isSignalCategory: LifecycleGroupFilterDefinition = {
  key: 'category:signal',
  matches: getEventTypeMatcher(signalCategoryEventTypes),
};
