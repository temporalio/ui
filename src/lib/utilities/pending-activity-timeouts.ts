import type { I18nKey } from '$lib/i18n';
import type {
  ActivityOptions,
  ActivityTaskScheduledEventAttributes,
} from '$lib/types';

import { formatDuration } from './format-time';

export type PendingActivityTimeout = {
  field:
    | 'scheduleToCloseTimeout'
    | 'scheduleToStartTimeout'
    | 'startToCloseTimeout'
    | 'heartbeatTimeout';
  label: I18nKey;
  /** Formatted duration, or '' when the timeout is not set. */
  formatted: string;
};

type DurationLike =
  | string
  | { seconds?: string | number | null; nanos?: number | null }
  | null
  | undefined;

type TimeoutSource =
  | ActivityOptions
  | ActivityTaskScheduledEventAttributes
  | null
  | undefined;

/**
 * The HTTP API sends durations as protojson seconds strings ('10s'); the proto
 * types describe them as `{seconds, nanos}`. Accept both. Mirrors the parsing
 * in activity-options-diff.
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
const formatTimeout = (duration: DurationLike): string => {
  const seconds = durationSeconds(duration);
  if (!seconds) return '';
  return formatDuration(`${seconds}s`);
};

const TIMEOUT_FIELDS: {
  field: PendingActivityTimeout['field'];
  label: I18nKey;
}[] = [
  {
    field: 'scheduleToCloseTimeout',
    label: 'workflows.schedule-to-close-timeout',
  },
  {
    field: 'scheduleToStartTimeout',
    label: 'workflows.schedule-to-start-timeout',
  },
  { field: 'startToCloseTimeout', label: 'workflows.start-to-close-timeout' },
  { field: 'heartbeatTimeout', label: 'activities.heartbeat-timeout' },
];

/**
 * All four activity timeouts for the Pending Activity view, including the
 * unset ones. An unset timeout formats as '' so the view can label it
 * "not set / unlimited" instead of hiding it. Returns [] when there is no
 * options source to read timeouts from.
 */
export const getPendingActivityTimeouts = (
  source: TimeoutSource,
): PendingActivityTimeout[] => {
  if (!source) return [];

  return TIMEOUT_FIELDS.map(({ field, label }) => ({
    field,
    label,
    formatted: formatTimeout(source[field] as DurationLike),
  }));
};

/**
 * Whether an ActivityOptions blob carries real values. The server returns the
 * complete current options, so an options blob with no task queue is an
 * unpopulated stub; callers should fall back to the scheduled event's
 * attributes in that case. Mirrors the guard in activity-options-diff.
 */
export const hasPopulatedActivityOptions = (
  options: ActivityOptions | null | undefined,
): boolean => {
  if (!options) return false;
  const taskQueue = options.taskQueue as
    | string
    | { name?: string | null }
    | null
    | undefined;
  const name = typeof taskQueue === 'string' ? taskQueue : taskQueue?.name;
  return Boolean(name);
};
