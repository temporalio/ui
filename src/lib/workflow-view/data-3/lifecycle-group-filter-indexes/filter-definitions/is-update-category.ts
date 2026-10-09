import type { EventType } from '$lib/types/events';

import type { LifecycleGroupFilterDefinition } from '../types';
import { getEventTypeMatcher } from './matchers/event-type';

const updateCategoryEventTypes = new Set<EventType>([
  'WorkflowExecutionUpdateAccepted',
  'WorkflowExecutionUpdateCompleted',
  'WorkflowExecutionUpdateRequested',
  'WorkflowExecutionUpdateRejected',
  'WorkflowExecutionUpdateAdmitted',
]);

export const isUpdateCategory: LifecycleGroupFilterDefinition = {
  key: 'category:update',
  matches: getEventTypeMatcher(updateCategoryEventTypes),
};
