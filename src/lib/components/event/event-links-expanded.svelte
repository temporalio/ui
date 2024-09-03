<script lang="ts">
  import Link from '$lib/holocene/link.svelte';
  import type { EventLink } from '$lib/types/events';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let links: EventLink[] = [];
</script>

{#if links?.length}
  {#each links as link}
    {#if link?.workflowEvent}
      <div class="content detail-row">
        <p class="text-sm">Link</p>
        <div class="badge text-sm">
          <Link
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
    {/if}
  {/each}
{/if}

<style lang="postcss">
  .content {
    @apply block w-full px-2 py-1 text-left;
  }

  .detail-row {
    @apply flex w-full items-center gap-4 py-1 text-left xl:flex;
  }

  .badge {
    @apply surface-subtle rounded-sm px-1 py-0.5;
  }
</style>
