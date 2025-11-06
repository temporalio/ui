<script lang="ts">
  import { fade } from 'svelte/transition';

  import { tick } from 'svelte';

  import { page } from '$app/state';

  import EventDetailsFull from '$lib/components/event/event-details-full.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { activeGroupHeight, setActiveGroup } from '$lib/stores/active-events';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

  import GraphWidget from './graph-widget.svelte';

  type Props = {
    group: EventGroup;
    canvasWidth: number;
    x?: number;
    y: number;
  };
  let { group, canvasWidth, x = 0, y }: Props = $props();
  let offsetHeight = $state(0);

  const namespace = $derived(page.params.namespace);
  let contentHeight = $derived(offsetHeight || 0);
  const childWorkflowStartedEvent = $derived(
    group && group.eventList.find(isChildWorkflowExecutionStartedEvent),
  );

  const setActiveGroupHeight = (height) => {
    $activeGroupHeight = height;
  };

  $effect(() => {
    setActiveGroupHeight(contentHeight);
  });

  const onDecode = async () => {
    await tick();
    contentHeight = offsetHeight;
  };
</script>

<g role="button" tabindex="0" class="relative z-50" in:fade>
  <foreignObject {x} {y} width={canvasWidth} height={contentHeight}>
    <div bind:offsetHeight class="flex flex-col">
      <EventDetailsFull {group} event={group.initialEvent}>
        {#snippet headerActions()}
          <Button
            variant="ghost"
            size="xs"
            on:click={() => setActiveGroup(group)}
            ><Icon name="close" class="text-white" /></Button
          >
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
