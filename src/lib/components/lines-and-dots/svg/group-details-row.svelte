<script lang="ts">
  import { onMount } from 'svelte';

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

  // PERF: ResizeObserver replaces bind:offsetHeight. The old approach read
  // element.offsetHeight inside Svelte's effect system on every reactive flush
  // (258 samples in CPUTraceClick2), forcing synchronous layout each time.
  // ResizeObserver delivers height from within its own callback — the browser
  // has already computed layout, so the read is free. The callback also fires
  // automatically when CodeMirror's lazy init swaps in the editor, eliminating
  // the need for an onDecode callback.
  let contentEl: HTMLDivElement | undefined;
  let contentHeight = 0;

  onMount(() => {
    if (!contentEl) return;
    const observer = new ResizeObserver(() => {
      const h = contentEl!.offsetHeight;
      if (h !== contentHeight) {
        contentHeight = h;
        onHeight?.(h);
      }
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  });

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
</script>

<g class="relative z-50">
  <foreignObject {x} {y} {width} height={contentHeight}>
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
          <Button
            variant="ghost"
            size="xs"
            on:click={() => setActiveGroup(group)}
            >{translate('common.close')} <Icon name="close" /></Button
          >
        </div>
      </div>
      <div class="surface-primary">
        <!-- PERF: lazy=true defers CodeMirror init to after the first paint so
             the panel opens immediately with a <pre> placeholder. The
             ResizeObserver above re-fires when CodeMirror replaces the <pre>,
             automatically re-measuring and calling onHeight. -->
        <EventDetailsFull {group} event={group.initialEvent} lazy={true} />
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
