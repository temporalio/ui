import { get } from 'svelte/store';

import {
  relativeTime,
  timeFormat,
  timestampFormat,
} from '$lib/stores/time-format';
import type { TimestampFormat } from '$lib/utilities/format-date';
import { formatDate } from '$lib/utilities/format-date';
import { isFutureDate, type ValidTime } from '$lib/utilities/format-time';

type TimestampOverride = TimestampFormat | 'relative' | 'absolute';

/**
 * Reactive date formatter that automatically uses the user's time format preferences.
 *
 * @param date - The date to format
 * @param override - Optional override:
 *   - 'relative': forces relative time (e.g., "5 days ago")
 *   - 'absolute': forces absolute time (e.g., "Jan 20, 2024")
 *   - 'short'/'medium'/'long': overrides format while respecting relative time setting
 * @returns Formatted date string that reactively updates when time format preferences change
 *
 * @example
 * ```svelte
 * <script>
 *   import { timestamp } from '$lib/runes/timestamp.svelte';
 *   let date = '2024-01-20T10:30:00Z';
 * </script>
 *
 * <p>{timestamp(date)}</p>
 * <p>{timestamp(date, 'short')}</p>
 * <p>{timestamp(date, 'relative')}</p>
 * <p>{timestamp(date, 'absolute')}</p>
 * ```
 */
export function timestamp(
  date: ValidTime | undefined | null,
  override?: TimestampOverride,
): string {
  const formattedDate = $derived.by(() => {
    const isRelativeOverride = override === 'relative';
    const isAbsoluteOverride = override === 'absolute';
    const format =
      isRelativeOverride || isAbsoluteOverride
        ? get(timestampFormat)
        : (override ?? get(timestampFormat));
    const relative = isRelativeOverride
      ? true
      : isAbsoluteOverride
        ? false
        : get(relativeTime);
    const relativeLabel =
      date && relative && isFutureDate(date) ? 'from now' : 'ago';

    return formatDate(date, get(timeFormat), {
      relative,
      format,
      relativeLabel,
    });
  });

  return formattedDate;
}
