<script lang="ts">
  import { onMount } from 'svelte';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';

  import GroupDetailsHeader from './group-details-header.svelte';

  type Props = {
    group: EventGroup;
    canvasWidth: number;
    endTime?: string | Date | number;
    x?: number;
    y: number;
    // Reports panel height so timeline-graph can shift the rows below it.
    onHeight?: (h: number) => void;
    timelineKey?: string;
    active?: boolean;
    /** The workflow whose history the group's events belong to. */
    historyOwner?: { namespace: string; workflowId: string; runId: string };
  };

  let {
    group,
    canvasWidth,
    endTime = Date.now(),
    x = 0,
    y,
    onHeight,
    timelineKey = group.id,
    active = true,
    historyOwner,
  }: Props = $props();

  // ResizeObserver so the height re-measures when CodeMirror lazily swaps in.
  let contentEl = $state<HTMLDivElement | undefined>(undefined);
  let contentHeight = 0;

  onMount(() => {
    if (!contentEl) return;
    const observer = new ResizeObserver(() => {
      const height = contentEl!.offsetHeight;
      if (height !== contentHeight) {
        contentHeight = height;
        onHeight?.(height);
      }
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  });
</script>

<div
  class="panel"
  style:left="{x}px"
  style:top="{y}px"
  style:width="{canvasWidth}px"
>
  <div bind:this={contentEl} class="flex flex-col">
    <GroupDetailsHeader
      class="relative h-full"
      {group}
      {endTime}
      {active}
      onClose={() => setActiveGroup(group, timelineKey)}
    />
    <div class="bg-surface-primary text-primary">
      <EventDetailsFull
        {group}
        {historyOwner}
        event={group.initialEvent}
        lazy={true}
        groupRow={true}
      />
    </div>
  </div>
</div>

<style lang="postcss">
  .panel {
    position: absolute;
    z-index: 50;
  }
</style>
