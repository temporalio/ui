import { lifecycleRetries } from '$lib/models/event-history/timeline-event-groups';
import {
  isWorkflowTaskGroup,
  type LazyGroup,
  lifecycleStatusOf,
} from '$lib/services/grouped-event-buffer';
import type { EventTypeCategory } from '$lib/types/events';
import { isSucceededGroup } from '$lib/utilities/get-failed-or-pending';

export type RunCounts = {
  activities: number;
  childWorkflows: number;
  timers: number;
  signals: number;
  nexusOperations: number;
  updates: number;
  succeeded: number;
  failed: number;
  retried: number;
};

export type CategoryCountKey = Exclude<
  keyof RunCounts,
  'succeeded' | 'failed' | 'retried'
>;

const CATEGORY_COUNTS: Partial<Record<EventTypeCategory, CategoryCountKey>> = {
  activity: 'activities',
  'local-activity': 'activities',
  'child-workflow': 'childWorkflows',
  timer: 'timers',
  signal: 'signals',
  nexus: 'nexusOperations',
  update: 'updates',
};

export const countRunGroups = (groups: readonly LazyGroup[]): RunCounts => {
  const counts: RunCounts = {
    activities: 0,
    childWorkflows: 0,
    timers: 0,
    signals: 0,
    nexusOperations: 0,
    updates: 0,
    succeeded: 0,
    failed: 0,
    retried: 0,
  };

  for (const group of groups) {
    if (isWorkflowTaskGroup(group)) {
      continue;
    }
    const count = CATEGORY_COUNTS[group.category];
    if (count) {
      counts[count]++;
    }
    counts.succeeded += Number(isSucceededGroup(group));
    const { failed, timedOut, highestAttempt } = lifecycleStatusOf(group);
    counts.failed += Number(failed) + Number(timedOut);
    counts.retried += lifecycleRetries(highestAttempt, group);
  }

  return counts;
};
