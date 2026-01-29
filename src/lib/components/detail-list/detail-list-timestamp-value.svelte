<script lang="ts">
  import type { Snippet } from 'svelte';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import type { ValidTime } from '$lib/utilities/format-time';

  import DetailListValue from './detail-list-value.svelte';

  interface Props {
    timestamp: ValidTime | undefined | null;
    children?: Snippet;
  }

  let { timestamp, children }: Props = $props();

  let formattedTimestamp = $derived(
    formatDate(timestamp, $timeFormat, {
      format: $timestampFormat,
      relative: false,
    }),
  );

  let relativeTimestamp = $derived(
    formatDate(timestamp, $timeFormat, { relative: true }),
  );
</script>

{#snippet content()}
  <div class="flex select-all items-center gap-1 truncate rounded-sm">
    {$relativeTime ? relativeTimestamp : formattedTimestamp}
  </div>
{/snippet}

<DetailListValue>
  <Tooltip
    text={$relativeTime ? formattedTimestamp : relativeTimestamp}
    top
    class="min-w-0"
  >
    {@render content()}
    {@render children?.()}
  </Tooltip>
</DetailListValue>
