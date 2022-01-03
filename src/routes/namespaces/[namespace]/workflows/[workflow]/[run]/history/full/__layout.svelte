<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export async function load({ stuff }: LoadInput) {
    const { workflow, events } = stuff as {
      workflow: WorkflowExecution;
      events: HistoryEventWithId[];
    };

    return {
      props: {
        events,
        pendingActivities: workflow.pendingActivities,
      },
    };
  }
</script>

<script lang="ts">
  import { eventTypeInCategory } from '$lib/utilities/get-event-categorization';

  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';
  import EventTable from '$lib/components/event-table.svelte';

  export let events: HistoryEventWithId[];
  export let pendingActivities: PendingActivity[];

  let category: EventTypeCategory = null;

  $: visibleEvents = events.filter(eventTypeInCategory(category));
  $: eventsAndActivities = [...pendingActivities, ...visibleEvents];
</script>

<EventTable events={eventsAndActivities}>
  <div slot="filters">
    <FilterSelect parameter="event-type" bind:value={category}>
      <Option value={null}>All</Option>
      <Option value="activity">Activity</Option>
      <Option value="command">Command</Option>
      <Option value="signal">Signal</Option>
      <Option value="timer">Timer</Option>
      <Option value="child-workflow">Child Workflow</Option>
      <Option value="workflow">Workflow</Option>
    </FilterSelect>
  </div>
  <div slot="details" class="w-full h-full py-4">
    <slot />
  </div>
</EventTable>
