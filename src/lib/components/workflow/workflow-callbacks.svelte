<script lang="ts">
  import AccordionLight from '$lib/holocene/accordion/accordion-light.svelte';
  import { fullEventHistory } from '$lib/stores/events';
  import type { Callback } from '$lib/types/nexus';

  import WorkflowCallback from './workflow-callback.svelte';

  export let callbacks: Callback[];

  $: initialEvent = $fullEventHistory[0];
  $: link = initialEvent?.links?.[0];

  $: firstCallback = callbacks[0];
</script>

<WorkflowCallback callback={firstCallback} {link}>
  {#if callbacks.length > 1}
    <div class="py-2">
      <AccordionLight let:open>
        <p class="p-1" slot="title">
          View {callbacks.length - 1} other Callbacks
        </p>
        {#if open}
          <div class="flex flex-col gap-2">
            {#each callbacks.slice(1) as callback}
              <WorkflowCallback {callback} />
            {/each}
          </div>
        {/if}
      </AccordionLight>
    </div>
  {/if}
</WorkflowCallback>
