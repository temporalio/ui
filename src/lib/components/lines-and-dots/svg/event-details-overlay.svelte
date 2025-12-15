<script lang="ts">
  import { fade } from 'svelte/transition';

  import { page } from '$app/state';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { clickoutside } from '$lib/holocene/outside-click';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

  import GraphWidget from './graph-widget.svelte';

  type Props = {
    group: EventGroup;
    onClose: () => void;
  };

  let { group, onClose }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const childWorkflowStartedEvent = $derived(
    group && group.eventList.find(isChildWorkflowExecutionStartedEvent),
  );

  const MIN_WIDTH = 320;
  const MAX_WIDTH = 900;
  const MIN_HEIGHT = 200;
  const MAX_HEIGHT = 800;

  let width = $state(480);
  let height = $state(400);
  let isResizing = $state(false);
  let startX = $state(0);
  let startY = $state(0);
  let startWidth = $state(0);
  let startHeight = $state(0);
  let handleRef: HTMLDivElement | null = $state(null);

  const onResizeStart = (e: PointerEvent) => {
    e.preventDefault();
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = width;
    startHeight = height;
    handleRef?.setPointerCapture(e.pointerId);
  };

  const onResizeMove = (e: PointerEvent) => {
    if (!isResizing) return;
    e.preventDefault();

    const deltaX = startX - e.clientX;
    const deltaY = e.clientY - startY;

    width = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + deltaX));
    height = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight + deltaY));
  };

  const onResizeEnd = (e: PointerEvent) => {
    if (!isResizing) return;
    isResizing = false;
    handleRef?.releasePointerCapture(e.pointerId);
  };
</script>

<div
  class="absolute right-4 top-4 z-50 flex flex-col overflow-hidden rounded-lg shadow-xl"
  style="width: {width}px; height: {height}px;"
  use:clickoutside={() => onClose()}
  transition:fade={{ duration: 150 }}
>
  <div class="min-h-0 flex-1 overflow-auto">
    {#key group}
      <EventDetailsFull {group} event={group.initialEvent} {height}>
        {#snippet headerActions()}
          <Button
            variant="ghost"
            size="xs"
            class="ml-1 h-10 w-10"
            on:click={onClose}
          >
            <Icon name="close" class="text-white" />
          </Button>
        {/snippet}
        {#if childWorkflowStartedEvent}
          <div>
            <div class="surface-primary">
              {#key group.eventList.length}
                <GraphWidget
                  {namespace}
                  workflowId={childWorkflowStartedEvent.attributes
                    .workflowExecution.workflowId}
                  runId={childWorkflowStartedEvent.attributes.workflowExecution
                    .runId}
                  viewportHeight={160}
                  class="surface-primary overflow-x-hidden border-t border-subtle"
                />
              {/key}
            </div>
          </div>
        {/if}
      </EventDetailsFull>
    {/key}
  </div>

  <div
    bind:this={handleRef}
    role="slider"
    tabindex="0"
    aria-label="Resize panel"
    aria-valuenow={width}
    class="flex h-5 shrink-0 cursor-nesw-resize items-center bg-slate-800"
    style="touch-action: none; user-select: none;"
    onpointerdown={onResizeStart}
    onpointermove={onResizeMove}
    onpointerup={onResizeEnd}
    onpointercancel={onResizeEnd}
  >
    <svg
      viewBox="0 0 10 10"
      class="pointer-events-none ml-1 h-3 w-3 rotate-90 text-white/50"
    >
      <path
        stroke="currentColor"
        stroke-width="1.5"
        fill="none"
        d="M1 9L9 1M5 9L9 5M9 9L9 9"
      />
    </svg>
  </div>
</div>
