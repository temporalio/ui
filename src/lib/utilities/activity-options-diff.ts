import type { I18nKey } from '$lib/i18n';
import type {
  ActivityOptions,
  ActivityTaskScheduledEventAttributes,
} from '$lib/types';

import { formatMaximumAttempts } from './format-event-attributes';
import { formatDuration } from './format-time';

export type ActivityOptionChange = {
  /** Stable key for `{#each}` and assertions, e.g. 'retryPolicy.maximumAttempts'. */
  field: string;
  label: I18nKey;
  /** Display value from the ActivityTaskScheduled event. '' when unset. */
  previous: string;
  /** Display value from the pending activity's current options. '' when unset. */
  current: string;
};

type DurationLike =
  | string
  | { seconds?: string | number | null; nanos?: number | null }
  | null
  | undefined;

type TaskQueueLike = string | { name?: string | null } | null | undefined;

type NormalizedValue = string | number | undefined;

/**
 * The HTTP API sends durations as protojson seconds strings ('10s'); the proto
 * types describe them as `{seconds, nanos}`. Accept both.
 */
const durationSeconds = (duration: DurationLike): number | undefined => {
  if (duration === null || duration === undefined || duration === '') {
    return undefined;
  }

  if (typeof duration === 'object') {
    const seconds = Number(duration.seconds ?? 0);
    const nanos = Number(duration.nanos ?? 0);
    if (!Number.isFinite(seconds) || !Number.isFinite(nanos)) return undefined;
    return seconds + nanos / 1e9;
  }

  const seconds = Number(String(duration).replace(/s$/, ''));
  return Number.isFinite(seconds) ? seconds : undefined;
};

/** A zero duration is the proto default, indistinguishable from unset. */
const normalizeDuration = (duration: DurationLike): number | undefined =>
  durationSeconds(duration) || undefined;

const formatSeconds = (seconds: NormalizedValue): string =>
  seconds === undefined ? '' : formatDuration(`${seconds}s`);

/**
 * Options carry `{name}`, the scheduled event carries `{name, kind}`, and
 * `simplifyAttributes` collapses a name-only queue to a bare string. Accept all
 * three so a caller passing either shape compares correctly.
 */
const normalizeTaskQueue = (taskQueue: TaskQueueLike): string | undefined => {
  const name = typeof taskQueue === 'string' ? taskQueue : taskQueue?.name;
  return name ? String(name) : undefined;
};

/** 0 attempts means unlimited, which is also what unset means. */
const normalizeMaximumAttempts = (
  attempts: number | null | undefined,
): number | undefined => {
  const value = Number(attempts ?? 0);
  return Number.isFinite(value) && value > 0 ? value : undefined;
};

/** The server's default when unset; the update form seeds the same fallback. */
const DEFAULT_BACKOFF_COEFFICIENT = 2;

const normalizeBackoffCoefficient = (
  coefficient: number | null | undefined,
): number => {
  const value = Number(coefficient ?? 0);
  return Number.isFinite(value) && value > 0
    ? value
    : DEFAULT_BACKOFF_COEFFICIENT;
};

type OptionSource = Partial<
  ActivityOptions & ActivityTaskScheduledEventAttributes
>;

type OptionField = {
  field: string;
  label: I18nKey;
  /** Normalized and comparable; `undefined` means unset. Runs on both sides. */
  read: (source: OptionSource) => NormalizedValue;
  format: (value: NormalizedValue) => string;
};

const durationField = (
  field: string,
  label: I18nKey,
  pick: (source: OptionSource) => unknown,
): OptionField => ({
  field,
  label,
  read: (source) => normalizeDuration(pick(source) as DurationLike),
  format: formatSeconds,
});

/**
 * Ordered to mirror ACTIVITY_OPTIONS_UPDATE_PATHS — the paths that can actually
 * be changed — with priority appended.
 *
 * `startDelay` is deliberately absent: ActivityTaskScheduled has no counterpart,
 * so every non-zero start delay would read as an update.
 */
const ACTIVITY_OPTION_FIELDS: OptionField[] = [
  {
    field: 'taskQueue',
    label: 'common.task-queue',
    read: (source) => normalizeTaskQueue(source.taskQueue as TaskQueueLike),
    format: (value) => (value === undefined ? '' : String(value)),
  },
  durationField(
    'scheduleToCloseTimeout',
    'workflows.schedule-to-close-timeout',
    (source) => source.scheduleToCloseTimeout,
  ),
  durationField(
    'scheduleToStartTimeout',
    'workflows.schedule-to-start-timeout',
    (source) => source.scheduleToStartTimeout,
  ),
  durationField(
    'startToCloseTimeout',
    'workflows.start-to-close-timeout',
    (source) => source.startToCloseTimeout,
  ),
  durationField(
    'heartbeatTimeout',
    'activities.heartbeat-timeout',
    (source) => source.heartbeatTimeout,
  ),
  durationField(
    'retryPolicy.initialInterval',
    'activities.retry-initial-interval',
    (source) => source.retryPolicy?.initialInterval,
  ),
  {
    field: 'retryPolicy.backoffCoefficient',
    label: 'activities.retry-backoff-coefficient',
    read: (source) =>
      normalizeBackoffCoefficient(source.retryPolicy?.backoffCoefficient),
    format: (value) => String(value),
  },
  durationField(
    'retryPolicy.maximumInterval',
    'activities.retry-maximum-interval',
    (source) => source.retryPolicy?.maximumInterval,
  ),
  {
    field: 'retryPolicy.maximumAttempts',
    label: 'activities.retry-max-attempts',
    read: (source) =>
      normalizeMaximumAttempts(source.retryPolicy?.maximumAttempts),
    format: (value) =>
      String(formatMaximumAttempts(value === undefined ? null : Number(value))),
  },
  {
    field: 'priority.priorityKey',
    label: 'workflows.priority',
    read: (source) => source.priority?.priorityKey || undefined,
    format: (value) => (value === undefined ? '' : String(value)),
  },
  {
    field: 'priority.fairnessKey',
    label: 'workflows.fairness',
    read: (source) => source.priority?.fairnessKey || undefined,
    format: (value) => (value === undefined ? '' : String(value)),
  },
];

/**
 * The options a pending Activity is currently running with that differ from the
 * ones it was scheduled with.
 *
 * Pass the RAW scheduled attributes (`event.activityTaskScheduledEventAttributes`),
 * not `event.attributes`: `simplifyAttributes` humanizes the latter's top-level
 * durations, which would make every timeout look changed.
 */
export const getUpdatedActivityOptions = (
  activityOptions: ActivityOptions | null | undefined,
  scheduledAttributes: ActivityTaskScheduledEventAttributes | null | undefined,
): ActivityOptionChange[] => {
  if (!activityOptions || !scheduledAttributes) return [];

  // The server returns the complete current options, so an options blob with no
  // task queue is an unpopulated stub. Diffing it would report every field as
  // cleared.
  if (!normalizeTaskQueue(activityOptions.taskQueue as TaskQueueLike))
    return [];

  const current = activityOptions as OptionSource;
  const previous = scheduledAttributes as OptionSource;

  const changes: ActivityOptionChange[] = [];
  for (const { field, label, read, format } of ACTIVITY_OPTION_FIELDS) {
    const currentValue = read(current);
    const previousValue = read(previous);
    if (currentValue === previousValue) continue;

    const formattedPrevious = format(previousValue);
    const formattedCurrent = format(currentValue);
    // A difference the display rounds away is not a change the user can see.
    if (formattedPrevious === formattedCurrent) continue;

    changes.push({
      field,
      label,
      previous: formattedPrevious,
      current: formattedCurrent,
    });
  }

  return changes;
};
