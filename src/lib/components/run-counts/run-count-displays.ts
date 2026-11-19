import type { I18nKey } from '$lib/i18n';
import {
  type IconComponent,
  IconTemporalActivity,
  IconTemporalChildWorkflow,
  IconTemporalNexus,
  IconTemporalSignal,
  IconTemporalTimer,
  IconTemporalUpdate,
} from '$lib/io/icon';
import type {
  CategoryCountKey,
  RunCounts,
} from '$lib/models/event-history/run-counts';
import type { EventTypeCategory } from '$lib/types/events';

export type CountDisplay = {
  key: CategoryCountKey;
  Icon: IconComponent;
  label: I18nKey;
  category: EventTypeCategory;
};

const COUNT_DISPLAYS: readonly CountDisplay[] = [
  {
    key: 'activities',
    Icon: IconTemporalActivity,
    label: 'workflows.run-count-activities',
    category: 'activity',
  },
  {
    key: 'childWorkflows',
    Icon: IconTemporalChildWorkflow,
    label: 'workflows.run-count-child-workflows',
    category: 'child-workflow',
  },
  {
    key: 'timers',
    Icon: IconTemporalTimer,
    label: 'workflows.run-count-timers',
    category: 'timer',
  },
  {
    key: 'signals',
    Icon: IconTemporalSignal,
    label: 'workflows.run-count-signals',
    category: 'signal',
  },
  {
    key: 'nexusOperations',
    Icon: IconTemporalNexus,
    label: 'workflows.run-count-nexus-operations',
    category: 'nexus',
  },
  {
    key: 'updates',
    Icon: IconTemporalUpdate,
    label: 'workflows.run-count-updates',
    category: 'update',
  },
];

export const nonZeroCountDisplays = (counts: RunCounts): CountDisplay[] =>
  COUNT_DISPLAYS.filter(({ key }) => counts[key] > 0);
