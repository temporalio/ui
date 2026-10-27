import type { EventType } from '$lib/types/events';

import type { LifecycleGroupFilterDefinition } from '../types';
import { getEventTypeMatcher } from './matchers/event-type';

const workflowCategoryEventTypes = new Set<EventType>([
  'WorkflowExecutionCanceled',
  'WorkflowExecutionCancelRequested',
  'WorkflowExecutionCompleted',
  'WorkflowExecutionContinuedAsNew',
  'WorkflowExecutionFailed',
  'WorkflowExecutionStarted',
  'WorkflowExecutionTerminated',
  'WorkflowExecutionTimedOut',
  'WorkflowExecutionOptionsUpdated',
  'WorkflowTaskCompleted',
  'WorkflowTaskFailed',
  'WorkflowTaskScheduled',
  'WorkflowTaskStarted',
  'WorkflowTaskTimedOut',
  'ExternalWorkflowExecutionCancelRequested',
  'RequestCancelExternalWorkflowExecutionFailed',
  'RequestCancelExternalWorkflowExecutionInitiated',
]);

export const isWorkflowCategory: LifecycleGroupFilterDefinition = {
  key: 'category:workflow',
  matches: getEventTypeMatcher(workflowCategoryEventTypes),
};
