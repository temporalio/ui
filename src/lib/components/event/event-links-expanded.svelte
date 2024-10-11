<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import type { EventLink } from '$lib/types/events';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let links: EventLink[] = [];
</script>

{#each links as link}
  {#if link?.workflowEvent}
    {@const href = routeForEventHistory({
      namespace: link.workflowEvent.namespace,
      workflow: link.workflowEvent.workflowId,
      run: link.workflowEvent.runId,
    })}
    <div class="content">
      <p class="text-sm">Link</p>
      <Link class="whitespace-pre-line" {href}>
        {link.workflowEvent.workflowId}
      </Link>
    </div>
  {/if}
{/each}

<style lang="postcss">
  .content {
    @apply block flex w-full w-full items-center gap-4 px-2 py-1 py-1 text-left text-left xl:flex;
  }
</style>
