<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import WorkflowStatus from '$lib/components/execution-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { timelineShowEventDetails } from '$lib/stores/timeline-preferences';
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
  const showEventDetails = $derived($timelineShowEventDetails);
  const detailsToggleTooltip = $derived(
    showEventDetails
      ? translate('events.show-payloads-only')
      : translate('events.show-event-details'),
  );

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
  data-testid="timeline-group-details"
  style:left="{x}px"
  style:top="{y}px"
  style:width="{canvasWidth}px"
>
  <div bind:this={contentEl} class="flex flex-col">
    <div
      class="surface-secondary relative flex min-h-control-sm items-center justify-between border-b border-subtle text-sm"
    >
      <div class="flex h-full items-center gap-2 px-2">
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
      <div class="flex shrink-0 items-center gap-1 pr-1">
        <Tooltip text={detailsToggleTooltip} bottomRight usePortal>
          <Button
            variant="ghost"
            size="xs"
            class="aspect-square px-0 {showEventDetails
              ? 'bg-interactive-secondary-active'
              : ''}"
            leadingIcon={showEventDetails ? 'eye-hide' : 'eye-show'}
            aria-label={translate('events.event-details-toggle')}
            aria-pressed={showEventDetails}
            data-testid="timeline-event-details-toggle"
            onclick={() => timelineShowEventDetails.set(!showEventDetails)}
          ></Button>
        </Tooltip>
        <Button variant="ghost" size="xs" onclick={() => setActiveGroup(group)}
          >{translate('common.close')} <Icon name="close" /></Button
        >
      </div>
    </div>
    <div class="surface-primary">
      <EventDetailsFull
        {group}
        event={group.initialEvent}
        lazy={true}
        showDetails={showEventDetails}
      />
    </div>
    {#if childWorkflowStartedEvent}
      <div class="surface-primary p-3">
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
    overflow: hidden;
    border: 1px solid rgb(var(--color-border-subtle));
    border-radius: var(--radius-panel, 8px);
    box-shadow: var(--shadow-floating, 0 8px 24px rgb(0 0 0 / 12%));
  }
</style>
