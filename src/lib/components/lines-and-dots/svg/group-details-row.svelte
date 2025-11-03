<script lang="ts">
  import { fade } from 'svelte/transition';

  import { cva } from 'class-variance-authority';
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
  $: contentHeight = offsetHeight + 20 || 0;

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

  const groupCategory = cva(
    [
      'relative flex h-full items-center justify-between rounded-t-lg text-sm text-white',
    ],
    {
      variants: {
        category: {
          workflow: 'bg-blue-800 ',
          activity: 'bg-purple-800 ',
          'child-workflow': 'bg-green-800 ',
          timer: 'bg-yellow-800 ',
          signal: 'bg-pink-800 ',
          update: 'bg-blue-800 ',
          other: 'bg-slate-800',
          nexus: 'bg-indigo-800',
          'local-activity': 'bg-slate-800 ',
          default: 'bg-purple-900 ',
        },
      },
    },
  );
</script>

<g role="button" tabindex="0" class="relative z-50" in:fade>
  <foreignObject {x} {y} {width} height={contentHeight}>
    <div bind:offsetHeight class="flex flex-col">
      <div
        class={groupCategory({
          category: group ? group.category : 'default',
        })}
      >
        <div
          class="flex h-full flex-col items-start gap-1 p-2 text-base md:flex-row md:items-center md:gap-4"
        >
          {#if status}
            <WorkflowStatus {status} big />
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
            ><Icon name="close" class="text-white" /></Button
          >
        </div>
      </div>
      <EventDetailsFull {group} event={group.initialEvent}>
        {#if childWorkflowStartedEvent}
          <div class="p-4">
            <div class="surface-primary">
              {#key group.eventList.length}
                <GraphWidget
                  {namespace}
                  workflowId={childWorkflowStartedEvent.attributes
                    .workflowExecution.workflowId}
                  runId={childWorkflowStartedEvent.attributes.workflowExecution
                    .runId}
                  viewportHeight={320}
                  class="surface-primary overflow-x-hidden border-t border-subtle"
                  onLoad={onDecode}
                />
              {/key}
            </div>
          </div>
        {/if}
      </EventDetailsFull>
    </div>
  </foreignObject>
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
