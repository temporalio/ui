<script lang="ts">
  import type { Snippet } from 'svelte';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { relativeTime } from '$lib/stores/time-format';
  import type { ValidTime } from '$lib/utilities/format-time';

  import { timestamp } from '../timestamp.svelte';

  import DetailListValue from './detail-list-value.svelte';

  interface Props {
    timestamp: ValidTime | undefined | null;
    children?: Snippet;
    fallback?: string;
  }

  let { timestamp: t, children, fallback }: Props = $props();

  let formattedTimestamp = $derived(
    t ? $timestamp(t) : fallback ? fallback : '',
  );
  let relativeTimestamp = $derived(
    t ? $timestamp(t, { relative: true }) : fallback ? fallback : '',
  );
</script>

{#snippet content()}
  <div class="flex select-all items-center gap-1 truncate rounded-sm">
    {$relativeTime ? relativeTimestamp : formattedTimestamp}
  </div>
{/snippet}

<DetailListValue>
  <Tooltip
    hide={!t}
    text={$relativeTime ? formattedTimestamp : relativeTimestamp}
    top
    class="min-w-0"
  >
    {@render content()}
    {@render children?.()}
  </Tooltip>
</DetailListValue>
