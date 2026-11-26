<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { relativeTime } from '$lib/stores/time-format';
  import type { ValidTime } from '$lib/utilities/format-time';
  import { createTruncationAttachment } from '$lib/utilities/truncation-attachment';

  import { timestamp } from '../timestamp.svelte';

  import DetailListValue from './detail-list-value.svelte';

  interface Props {
    timestamp: ValidTime | undefined | null;
    fallback?: string;
    class?: string;
  }

  let { timestamp: t, class: className, fallback }: Props = $props();

  let formattedTimestamp = $derived(
    t ? $timestamp(t, { relative: false }) : fallback ? fallback : '',
  );
  let relativeTimestamp = $derived(
    t ? $timestamp(t, { relative: true }) : fallback ? fallback : '',
  );
  let displayedTimestamp = $derived(
    $relativeTime ? relativeTimestamp : formattedTimestamp,
  );

  let isTruncated = $state(false);
  const truncationAttachment = createTruncationAttachment({
    onTruncationChange: (truncated) => {
      isTruncated = truncated;
    },
  });

  let tooltipText = $derived.by(() => {
    // if displayed timestamp is truncated, tooltip shows full displayed timestamp
    // if it's not truncated, we show the opposite formatting (relative <-> absolute)
    if (isTruncated) {
      return displayedTimestamp;
    }

    return $relativeTime ? formattedTimestamp : relativeTimestamp;
  });
</script>

<DetailListValue class={twMerge('font-mono', className)}>
  <Tooltip hide={!t} text={tooltipText} top class="min-w-0">
    <div class="select-all truncate" {@attach truncationAttachment}>
      {displayedTimestamp}
    </div>
  </Tooltip>
</DetailListValue>
