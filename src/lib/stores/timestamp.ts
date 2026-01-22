import { derived } from 'svelte/store';

import {
  relativeTime,
  timeFormat,
  timestampFormat,
} from '$lib/stores/time-format';
import {
  formatDate,
  type TimestampFormat,
  type ValidTime,
} from '$lib/utilities/format-date';

type TimestampOptions = {
  format?: TimestampFormat | 'relative';
  relativeLabel?: string;
};

/**
 * Reactive timestamp formatter that automatically uses the user's time format preferences.
 * This is a derived store containing a function. Unwrap with $ prefix to use.
 *
 * @example
 * ```svelte
 * <script>
 *   import { timestamp } from '$lib/stores/timestamp';
 * </script>
 *
 * <p>{$timestamp(activity.startTime)}</p>
 * <p>{$timestamp(date, { format: 'short' })}</p>
 * <p>{$timestamp(date, { format: 'relative', relativeLabel: '' })}</p>
 * ```
 */
export const timestamp = derived(
  [timeFormat, relativeTime, timestampFormat],
  ([$timeFormat, $relativeTime, $timestampFormat]) => {
    return (
      date: ValidTime | undefined | null,
      options?: TimestampOptions,
    ): string => {
      const isRelativeOverride = options?.format === 'relative';

      const format = isRelativeOverride
        ? $timestampFormat
        : (options?.format ?? $timestampFormat);
      const relative = isRelativeOverride ? true : $relativeTime;
      const relativeLabel = options?.relativeLabel ?? undefined;

      return formatDate(date, $timeFormat, {
        relative,
        format,
        relativeLabel,
      });
    };
  },
);
