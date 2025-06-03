<script lang="ts">
  import { tick } from 'svelte';

  import { page } from '$app/stores';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { activeGroupHeight, setActiveGroup } from '$lib/stores/active-events';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

  import GraphWidget from './graph-widget.svelte';

  export let group: EventGroup;
  export let canvasWidth: number;
  export let x = 0;
  export let y: number;

  let offsetHeight;
  $: contentHeight = offsetHeight || 0;

  const setActiveGroupHeight = (height) => {
    $activeGroupHeight = height;
  };

  $: setActiveGroupHeight(contentHeight || 0);

  $: status = group?.finalClassification || group?.classification;
  $: ({ namespace } = $page.params);
  $: width = canvasWidth;
  $: title = group.displayName;

  $: childWorkflowStartedEvent =
    group && group.eventList.find(isChildWorkflowExecutionStartedEvent);

  $: duration = formatDistanceAbbreviated({
    start: group?.initialEvent?.eventTime,
    end: group?.lastEvent?.eventTime,
    includeMilliseconds: true,
  });

  $: {
    if (group?.pendingActivity) {
      if (group.pendingActivity.attempt > 1) {
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

<g role="button" tabindex="0" class="relative z-50">
  <foreignObject {x} {y} {width} height={contentHeight}>
    <div bind:offsetHeight class="flex flex-col border-b border-subtle">
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
      <div class="surface-primary px-2">
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
