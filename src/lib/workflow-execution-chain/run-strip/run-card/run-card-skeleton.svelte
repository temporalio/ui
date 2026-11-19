<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';

  import { MIN_CARD_WIDTH } from '../card-layout';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    width?: number;
  }

  let { width = MIN_CARD_WIDTH, ...props }: Props = $props();
</script>

<div
  {...props}
  class="flex shrink-0 flex-col gap-2 rounded-md border border-secondary bg-surface-secondary p-2"
  style:width="{width}px"
>
  <Skeleton class="h-3.5 w-3/4" />
  <Skeleton class="h-1.5 w-full rounded-full" />
  <Skeleton class="h-3.5 w-1/2" />
</div>
