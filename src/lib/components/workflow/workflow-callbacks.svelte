<script lang="ts">
  import AccordionLight from '$lib/holocene/accordion/accordion-light.svelte';
  import { fullEventHistory } from '$lib/stores/events';
  import type { Callback } from '$lib/types/nexus';

  import WorkflowCallback from './workflow-callback.svelte';

  type Props = {
    callbacks: Callback[];
  };

  const { callbacks }: Props = $props();
  const initialEvent = $derived(() => $fullEventHistory[0]);
  const link = $derived(() => initialEvent()?.links?.[0]);

  const firstCallback = $derived(() => callbacks[0]);
</script>

<WorkflowCallback callback={firstCallback()} link={link()}>
  {#if callbacks.length > 1}
    <div class="py-2">
      <AccordionLight>
        {#snippet titleName()}
          <p class="p-1" slot="title">
            View {callbacks.length - 1} other Callbacks
          </p>
        {/snippet}
        {#snippet children({ open })}
          {#if open}
            <div class="flex flex-col gap-2">
              {#each callbacks.slice(1) as callback}
                <WorkflowCallback {callback} />
              {/each}
            </div>
          {/if}
        {/snippet}
      </AccordionLight>
    </div>
  {/if}
</WorkflowCallback>
