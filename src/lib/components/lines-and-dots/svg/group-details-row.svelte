<script lang="ts">
  import { tick } from 'svelte';

  import { page } from '$app/stores';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { formatEventGroupDuration } from '$lib/utilities/event-group-duration';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

  import GraphWidget from './graph-widget.svelte';

  export let group: EventGroup;
  export let canvasWidth: number;
  export let endTime: string | Date | number = Date.now();
  export let x = 0;
  export let y: number;
  // PERF: Callback so timeline-graph can update the <g transform> on the row
  // section below this panel. This is the only way panel height flows back up —
  // it goes into a single SVG transform attribute (O(1)), NOT into per-row Y
  // positions (which was the O(N) cascade we eliminated).
  export let onHeight: ((h: number) => void) | undefined = undefined;

  // PERF: bind:offsetHeight is kept only to size the foreignObject correctly.
  // Previously, contentHeight was also written to $activeGroupHeight, which
  // caused expandedGroupHeight in timeline-graph.svelte to change, dirtying
  // all 10k rows and producing 2× UpdateLayoutTree over 63k nodes (~504ms).
  // That cascade is now broken: rows no longer use $activeGroupHeight at all.
  let offsetHeight;
  $: contentHeight = offsetHeight || 0;
  $: onHeight?.(contentHeight);

  $: status = group?.finalClassification || group?.classification;
  $: ({ namespace } = $page.params);
  $: width = canvasWidth;
  $: title = group.displayName;

  $: childWorkflowStartedEvent =
    group && group.eventList.find(isChildWorkflowExecutionStartedEvent);

  $: duration = formatEventGroupDuration({
    group,
    endTime,
    includeMilliseconds: true,
  });

  $: {
    if (group?.pendingActivity) {
      if (group.pendingActivity.paused) {
        status = translate('workflows.paused');
      } else if (group.pendingActivity.attempt > 1) {
        status = translate('events.event-classification.retrying');
      } else {
        status = translate('events.event-classification.pending');
      }
    }
  }

  const onDecode = async () => {
    await tick();
    contentHeight = offsetHeight;
  };
</script>

<g class="relative z-50">
  <foreignObject {x} {y} {width} height={contentHeight}>
    <div bind:offsetHeight class="flex flex-col">
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
          {#key group.eventList.length}
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
