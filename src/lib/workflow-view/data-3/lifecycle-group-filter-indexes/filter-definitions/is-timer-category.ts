import type { EventType } from '$lib/types/events';

import type { LifecycleGroupFilterDefinition } from '../types';
import { getEventTypeMatcher } from './matchers/event-type';

const timerCategoryEventTypes = new Set<EventType>([
  'TimerCanceled',
  'TimerFired',
  'TimerStarted',
]);

export const isTimerCategory: LifecycleGroupFilterDefinition = {
  key: 'category:timer',
  matches: getEventTypeMatcher(timerCategoryEventTypes),
};
