<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import type { EventLink } from '$lib/types/events';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let link: EventLink;
</script>

<div
  class="flex max-w-lg flex-row items-center gap-2 overflow-hidden first:pt-0 last:border-b-0 xl:max-w-xl {$$props.class}"
>
  <p class="max-w-fit whitespace-nowrap text-right text-xs">Link</p>
  <div class="flex w-full items-center gap-2 pr-1">
    <div class="truncate text-sm">
      <Link
        class="badge truncate"
        href={routeForEventHistory({
          namespace: link.workflowEvent.namespace,
          workflow: link.workflowEvent.workflowId,
          run: link.workflowEvent.runId,
        })}
      >
        {link.workflowEvent.workflowId}
      </Link>
    </div>
  </div>
</div>

<style lang="postcss">
  .badge {
    @apply surface-subtle overflow-hidden rounded-sm p-1;
  }

  .payload {
    @apply overflow-hidden rounded bg-space-black px-1 py-0.5 font-mono text-xs text-white;
  }
</style>
