<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import WorkflowStatus from '$lib/components/execution-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { formatEventGroupDuration } from '$lib/utilities/event-group-duration';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

  import GraphWidget from './graph-widget.svelte';

  type Props = {
    group: EventGroup;
    canvasWidth: number;
    endTime?: string | Date | number;
    x?: number;
    y: number;
    // Reports panel height so timeline-graph can shift the rows below it.
    onHeight?: (h: number) => void;
  };

  let {
    group,
    canvasWidth,
    endTime = Date.now(),
    x = 0,
    y,
    onHeight,
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

  const namespace = $derived($page.params.namespace);
  const title = $derived(group.displayName);

  const childWorkflowStartedEvent = $derived(
    group && group.eventList.find(isChildWorkflowExecutionStartedEvent),
  );

  const duration = $derived(
    formatEventGroupDuration({ group, endTime, includeMilliseconds: true }),
  );

  const status = $derived.by(() => {
    const pending = group?.pendingActivity;
    if (pending) {
      if (pending.paused) return translate('workflows.paused');
      if ((pending.attempt ?? 0) > 1) {
        return translate('events.event-classification.retrying');
      }
      return translate('events.event-classification.pending');
    }
    return group?.finalClassification || group?.classification;
  });
</script>

<div
  class="panel"
  style:left="{x}px"
  style:top="{y}px"
  style:width="{canvasWidth}px"
>
  <div bind:this={contentEl} class="flex flex-col">
    <div
      class="relative flex h-full items-center justify-between bg-slate-50 text-sm dark:bg-slate-800"
    >
      <div class="flex h-full items-center gap-4 px-2">
        {#if status}
          <WorkflowStatus {status} />
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
        <Button variant="ghost" size="xs" on:click={() => setActiveGroup(group)}
          >{translate('common.close')} <Icon name="close" /></Button
        >
      </div>
    </div>
    <div class="surface-primary">
      <EventDetailsFull {group} event={group.initialEvent} lazy={true} />
    </div>
    {#if childWorkflowStartedEvent}
      <div class="surface-primary p-4">
        <div class="font-medium leading-4 text-secondary">Child Workflow</div>
        {#key group.eventList.length}
          {#if childWorkflowStartedEvent.attributes.workflowExecution?.workflowId}
            <GraphWidget
              {namespace}
              workflowId={childWorkflowStartedEvent.attributes.workflowExecution
                .workflowId}
              runId={childWorkflowStartedEvent.attributes.workflowExecution
                .runId ?? undefined}
              viewportHeight={320}
              class="surface-primary overflow-x-hidden border-t border-subtle"
            />
          {/if}
        {/key}
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .panel {
    position: absolute;
    z-index: 50;
  }
</style>
