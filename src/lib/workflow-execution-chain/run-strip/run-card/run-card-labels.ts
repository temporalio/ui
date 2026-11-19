import type { I18nKey } from '$lib/i18n';
import { translate } from '$lib/i18n/translate';
import {
  type IconComponent,
  IconTemporalActivity,
  IconTemporalChildWorkflow,
  IconTemporalNexus,
  IconTemporalSignal,
  IconTemporalTimer,
  IconTemporalUpdate,
} from '$lib/io/icon';
import type { EventTypeCategory } from '$lib/types/events';
import type { WorkflowStatus } from '$lib/types/workflows';

import type { Transition } from '../transitions';
import type { RunCounts } from './run-counts';

export type RunCardLoadState = 'loading' | 'partial' | 'complete' | 'error';

export type RunCardMode = 'live' | 'latest';

type CategoryCountKey = Exclude<keyof RunCounts, 'failed' | 'retried'>;

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

const STATUS_LABELS: Record<NonNullable<WorkflowStatus>, I18nKey> = {
  Running: 'workflows.running',
  Paused: 'workflows.paused',
  Completed: 'workflows.completed',
  ContinuedAsNew: 'workflows.continued-as-new',
  Failed: 'workflows.failed',
  TimedOut: 'workflows.timed-out',
  Terminated: 'workflows.terminated',
  Canceled: 'workflows.canceled',
};

const TRANSITION_DESCRIPTIONS: Record<Transition, I18nKey> = {
  continuedAsNew: 'workflows.transition-continued-as-new-description',
  retry: 'workflows.transition-retry-description',
  cron: 'workflows.transition-cron-description',
};

const MODE_LABELS: Record<RunCardMode, I18nKey> = {
  live: 'workflows.live',
  latest: 'workflows.latest',
};

const LOAD_STATE_DESCRIPTIONS: Partial<Record<RunCardLoadState, I18nKey>> = {
  partial: 'workflows.run-card-still-loading',
  loading: 'workflows.run-card-loading-events',
  error: 'workflows.run-card-load-failed',
};

export const nonZeroCountDisplays = (counts: RunCounts): CountDisplay[] =>
  COUNT_DISPLAYS.filter(({ key }) => counts[key] > 0);

export const partialSuffix = (loadState: RunCardLoadState): string =>
  loadState === 'partial' ? '+' : '';

export const runCardName = ({
  runId,
  status,
  mode,
  duration,
}: {
  runId: string;
  status: WorkflowStatus;
  mode: RunCardMode | null;
  duration: string;
}): string => {
  const shortId = runId.slice(0, 8);
  const statusLabel = status ? translate(STATUS_LABELS[status]) : '';
  if (!mode) {
    return translate('workflows.run-card-name', {
      shortId,
      status: statusLabel,
      duration,
    });
  }
  return translate('workflows.run-card-name-with-mode', {
    shortId,
    status: statusLabel,
    mode: translate(MODE_LABELS[mode]).toLowerCase(),
    duration,
  });
};

export const runCardDescription = ({
  runId,
  counts,
  loadState,
  transition,
}: {
  runId: string;
  counts: RunCounts;
  loadState: RunCardLoadState;
  transition: Transition | null;
}): string => {
  const suffix = partialSuffix(loadState);
  const descriptionParts = [runId];
  for (const { key, label } of nonZeroCountDisplays(counts)) {
    descriptionParts.push(translate(label, { count: counts[key], suffix }));
  }
  if (counts.failed) {
    descriptionParts.push(
      translate('workflows.run-count-failed', { count: counts.failed, suffix }),
    );
  }
  if (counts.retried) {
    descriptionParts.push(
      translate('workflows.run-count-retried', {
        count: counts.retried,
        suffix,
      }),
    );
  }
  const loadStateDescription = LOAD_STATE_DESCRIPTIONS[loadState];
  if (loadStateDescription) {
    descriptionParts.push(translate(loadStateDescription));
  }
  descriptionParts.push(
    translate(
      transition
        ? TRANSITION_DESCRIPTIONS[transition]
        : 'workflows.start-of-chain',
    ),
  );
  return descriptionParts.join(', ');
};
