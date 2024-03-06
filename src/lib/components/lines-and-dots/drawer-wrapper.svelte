<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';

  import DetailsDrawer from './details-drawer.svelte';

  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let clearActive: () => void;

  $: activeDetails = activeGroup || activeEvent;

  let canvasWidth = 1000;
</script>

<div class="relative flex max-h-[600px] w-full gap-0 overflow-auto">
  <div
    class="overflow-x-hidden {activeDetails ? 'w-1/2' : 'w-full'}"
    bind:clientWidth={canvasWidth}
  >
    <slot {canvasWidth} />
  </div>
  {#if activeDetails}
    <div class="sticky top-0 w-1/2 grow">
      <DetailsDrawer {activeEvent} {activeGroup} {clearActive} />
    </div>
  {/if}
</div>
