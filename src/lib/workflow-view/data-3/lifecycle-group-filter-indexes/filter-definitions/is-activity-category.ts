import type { EventType } from '$lib/types/events';

import type { LifecycleGroupFilterDefinition } from '../types';
import { getEventTypeMatcher } from './matchers/event-type';

const activityCategoryEventTypes = new Set<EventType>([
  'ActivityTaskCancelRequested',
  'ActivityTaskCanceled',
  'ActivityTaskCompleted',
  'ActivityTaskFailed',
  'ActivityTaskScheduled',
  'ActivityTaskStarted',
  'ActivityTaskTimedOut',
]);

export const isActivityCategory: LifecycleGroupFilterDefinition = {
  key: 'category:activity',
  matches: getEventTypeMatcher(activityCategoryEventTypes),
};
