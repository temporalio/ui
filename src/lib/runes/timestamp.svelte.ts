import { derived } from 'svelte/store';

import {
  relativeTime,
  timeFormat,
  timestampFormat,
} from '$lib/stores/time-format';
import type { TimestampFormat } from '$lib/utilities/format-date';
import { formatDate } from '$lib/utilities/format-date';
import { isFutureDate, type ValidTime } from '$lib/utilities/format-time';

type TimestampOverride = TimestampFormat | 'relative';

/**
 * Reactive timestamp formatter that automatically uses the user's time format preferences.
 * This is a derived store containing a function. Unwrap with $ prefix to use.
 *
 * @example
 * ```svelte
 * <script>
 *   import { timestamp } from '$lib/runes/timestamp.svelte';
 * </script>
 *
 * <p>{$timestamp(activity.startTime)}</p>
 * <p>{$timestamp(date, 'short')}</p>
 * ```
 */
export const timestamp = derived(
  [timeFormat, relativeTime, timestampFormat],
  ([$timeFormat, $relativeTime, $timestampFormat]) => {
    return (
      date: ValidTime | undefined | null,
      override?: TimestampOverride,
    ): string => {
      const isRelativeOverride = override === 'relative';
      const format = isRelativeOverride
        ? $timestampFormat
        : (override ?? $timestampFormat);
      const relative = isRelativeOverride ? true : $relativeTime;
      const relativeLabel =
        date && relative && isFutureDate(date) ? 'from now' : 'ago';

      return formatDate(date, $timeFormat, {
        relative,
        format,
        relativeLabel,
      });
    };
  },
);
