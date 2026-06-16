<script lang="ts">
  import { onMount, tick } from 'svelte';

  import { page } from '$app/state';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { activeGroupHeight, setActiveGroup } from '$lib/stores/active-events';
  import { formatEventGroupDuration } from '$lib/utilities/event-group-duration';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

  import GraphWidget from './graph-widget.svelte';

  interface Props {
    group: EventGroup;
    canvasWidth: number;
    endTime?: string | Date | number;
    x?: number;
    y: number;
  }

  let { group, canvasWidth, endTime = Date.now(), x = 0, y }: Props = $props();

  let container = $state<HTMLElement | undefined>();
  let contentHeight = $state(0);

  const status = $derived(group?.finalClassification || group?.classification);
  const { namespace } = $derived(page.params);
  const width = $derived(canvasWidth);
  const title = $derived(group.displayName);

  const childWorkflowStartedEvent = $derived(
    group?.eventList.find(isChildWorkflowExecutionStartedEvent),
  );

  const duration = $derived(
    formatEventGroupDuration({
      group,
      endTime,
      includeMilliseconds: true,
    }),
  );

  const pendingStatus = $derived.by(() => {
    if (group?.pendingActivity) {
      if (group.pendingActivity.paused) return translate('workflows.paused');
      if (group.pendingActivity.attempt > 1)
        return translate('events.event-classification.retrying');
      return translate('events.event-classification.pending');
    }
    return null;
  });

  const displayStatus = $derived(pendingStatus ?? status);

  // Write activeGroupHeight outside the reactive chain so it doesn't cause a
  // synchronous cascade during the same frame as the click. ResizeObserver
  // callbacks are batched by the browser after layout, avoiding forced reflow.
  $effect(() => {
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0;
      if (h !== contentHeight) {
        contentHeight = h;
        activeGroupHeight.set(h);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  });

  const onDecode = async () => {
    await tick();
    if (container) {
      const h = container.offsetHeight;
      if (h !== contentHeight) {
        contentHeight = h;
        activeGroupHeight.set(h);
      }
    }
  };
</script>

<g role="button" tabindex="0" class="relative z-50">
  <foreignObject {x} {y} {width} height={contentHeight}>
    <div bind:this={container} class="flex flex-col">
      <div
        class="relative flex h-full items-center justify-between bg-slate-50 text-sm dark:bg-slate-800"
      >
        <div class="flex h-full items-center gap-4 px-2">
          {#if displayStatus}
            <WorkflowStatus status={displayStatus} />
          {/if}
          {title}
          {#if duration}
            <div class="flex items-center gap-1">
              <Icon name="clock" />
              {duration}
            </div>
          {/if}
        </div>
        <div class="flex items-center gap-4">
          <Button
            variant="ghost"
            size="xs"
            on:click={() => setActiveGroup(group)}
            >{translate('common.close')} <Icon name="close" /></Button
          >
        </div>
      </div>
      <div class="surface-primary">
        <EventDetailsFull {group} event={group.initialEvent} />
      </div>
      {#if childWorkflowStartedEvent}
        <div class="surface-primary p-4">
          <div class="font-medium leading-4 text-secondary">Child Workflow</div>
          {#key group.eventIds.size}
            <GraphWidget
              {namespace}
              workflowId={childWorkflowStartedEvent.attributes.workflowExecution
                .workflowId}
              runId={childWorkflowStartedEvent.attributes.workflowExecution
                .runId}
              viewportHeight={320}
              class="surface-primary overflow-x-hidden border-t border-subtle"
              onLoad={onDecode}
            />
          {/key}
        </div>
      {/if}
    </div>
  </foreignObject>
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
