<script lang="ts">
  import { page } from '$app/stores';

  import EventDetailsRow from '$lib/components/event/event-details-row.svelte';
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import {
    eventFilterSort,
    type EventSortOrder,
    eventViewType,
  } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { refresh } from '$lib/stores/workflow-run';
  import type { EventView, WorkflowEvent } from '$lib/types/events';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { getSingleAttributeForEvent } from '$lib/utilities/get-single-attribute-for-event';

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);

  const resetFullHistory = () => {
    $fullEventHistory = [];
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
    view: EventView,
    sort: EventSortOrder,
  ) => {
    resetFullHistory();
    $fullEventHistory = await fetchAllEvents({
      namespace,
      workflowId,
      runId,
      sort: view === 'feed' ? sort : 'ascending',
    });
  };

  $: $refresh,
    fetchEvents(namespace, workflowId, runId, $eventViewType, $eventFilterSort);
  $: groups = groupEvents($fullEventHistory, $eventFilterSort);

  let activeGroup;
  let compact = false;

  const getIcon = (event: WorkflowEvent) => {
    console.log('Category: ', event.category);
    switch (event.category) {
      case 'workflow':
        return 'workflow';
      case 'activity':
        return 'temporal';
      case 'signal':
        return 'lightning-bolt';
      case 'marker':
        return 'bookmark';
      case 'timer':
        return 'clock';
      case 'command':
        return 'rocket-ship';
      case 'child-workflow':
        return 'relationship';
      default:
        return 'temporal';
    }
  };

  const onHover = (event: WorkflowEvent) => {
    activeGroup = groups.find((g) => g.eventIds.has(event.id));
  };
</script>

<div class="flex flex-col gap-2">
  <div class="flex flex-col gap-2 rounded-lg bg-gray-900 md:h-auto md:flex-row">
    <div
      class="flex grow flex-col gap-1 rounded-lg bg-gray-900 py-2 text-white"
    >
      {#each compact ? groups : $fullEventHistory as event}
        <div
          class="flex items-center gap-6 px-4 py-1"
          on:mouseover={() => onHover(event)}
          on:focus={() => onHover(event)}
          on:mouseleave={() => (activeGroup = undefined)}
          class:active={activeGroup?.eventIds?.has(event.id)}
        >
          <div
            class="vertical-center flex h-6 w-6 items-center rounded-full border-2 border-green-400 bg-green-400"
          >
            <Icon name={getIcon(event)} class="scale-85 text-gray-900" />
          </div>
          <div class="flex grow items-center justify-between">
            {event.name}
            <EventDetailsRow
              {...getSingleAttributeForEvent(event)}
              attributes={formatAttributes(event)}
              inline
            />
          </div>
        </div>
      {/each}
    </div>
    <div class="rounded-lg bg-gray-400 px-4 py-2">
      <ToggleSwitch
        label={'Compact'}
        labelPosition="left"
        id="autorefresh"
        checked={compact}
        on:change={() => (compact = !compact)}
      />
    </div>
  </div>
  <EventSummary />
  <!-- <EventHistoryTimeline history={$fullEventHistory} /> -->
</div>

<style lang="postcss">
  .active {
    @apply bg-blurple;
  }
</style>
