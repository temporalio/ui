<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';

  import { CanvasConfig } from './constants';

  import DetailsDrawer from './details-drawer.svelte';

  export let activeGroup: EventGroup | undefined = undefined;
  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let clearActive: () => void;

  $: activeDetails = activeGroup || activeEvent;

  let canvasWidth = 1000;

  let box;
  let scrollY = 0;

  function parseScroll() {
    // scrollY = box.scrollTop;
  }
</script>

<div
  class="relative flex h-auto max-h-[{CanvasConfig.maxHeight}px] w-full gap-0 overflow-auto"
  bind:this={box}
  on:scroll={parseScroll}
>
  <div
    class="relative h-full {activeDetails ? 'w-1/2' : 'w-full'} overflow-hidden"
    bind:clientWidth={canvasWidth}
  >
    <slot {canvasWidth} {scrollY} />
  </div>
  {#if activeDetails}
    <div class="sticky top-0 w-1/2 grow">
      <DetailsDrawer {activeEvent} {activeGroup} {clearActive} />
    </div>
  {/if}
</div>
