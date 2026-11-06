import type { EventType } from '$lib/types/events';

import type { LifecycleGroupFilterDefinition } from '../types';
import { getEventTypeMatcher } from './matchers/event-type';

const childWorkflowCategoryEventTypes = new Set<EventType>([
  'ChildWorkflowExecutionCanceled',
  'ChildWorkflowExecutionCompleted',
  'ChildWorkflowExecutionFailed',
  'ChildWorkflowExecutionStarted',
  'ChildWorkflowExecutionTerminated',
  'ChildWorkflowExecutionTimedOut',
  'StartChildWorkflowExecutionFailed',
  'StartChildWorkflowExecutionInitiated',
]);

export const isChildWorkflowCategory: LifecycleGroupFilterDefinition = {
  key: 'category:child-workflow',
  matches: getEventTypeMatcher(childWorkflowCategoryEventTypes),
};
