<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { IconPause, IconRetry } from '$lib/io/icon';
  import type { Timestamp } from '$lib/types';
  import { toTimeDifference } from '$lib/utilities/to-time-difference';

  interface Props {
    attempt: number;
    maximumAttempts?: number | null;
    paused?: boolean;
    nextRetryTime?: Timestamp | null;
    class?: string;
  }

  let {
    attempt,
    maximumAttempts,
    paused = false,
    nextRetryTime,
    class: className,
  }: Props = $props();

  const retrying = $derived(attempt > 1);
  const nextRetry = $derived(
    retrying && nextRetryTime
      ? toTimeDifference({
          date: nextRetryTime,
          negativeDefault: '',
        })
      : '',
  );
  const text = $derived(
    `${translate('workflows.attempt')} ${attempt}${
      maximumAttempts === undefined ? '' : ` / ${maximumAttempts || '∞'}`
    }`,
  );
  const extension = $derived(
    nextRetry
      ? { text: `${translate('workflows.next-retry')} ${nextRetry}` }
      : undefined,
  );
</script>

<Badge
  {text}
  colorScheme={paused ? 'warning' : retrying ? 'danger' : 'neutral'}
  Icon={paused ? IconPause : IconRetry}
  {extension}
  class={className}
/>
