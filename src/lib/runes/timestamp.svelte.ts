import { get } from 'svelte/store';

import {
  relativeTime,
  timeFormat,
  timestampFormat,
} from '$lib/stores/time-format';
import type { TimestampFormat } from '$lib/utilities/format-date';
import { formatDate } from '$lib/utilities/format-date';
import { isFutureDate, type ValidTime } from '$lib/utilities/format-time';

/**
 * Reactive date formatter that automatically uses the user's time format preferences.
 *
 * @param date - The date to format
 * @param overrideFormat - Optional format override ('short' | 'medium' | 'long')
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
 * ```
 */
export function timestamp(
  date: ValidTime | undefined | null,
  overrideFormat?: TimestampFormat,
): string {
  const formattedDate = $derived.by(() => {
    const format = overrideFormat ?? get(timestampFormat);
    const relative = get(relativeTime);
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
