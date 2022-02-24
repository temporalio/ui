<script lang="ts" context="module">
  import type { LoadInput } from '@sveltejs/kit';

  export const load = async ({ stuff }: LoadInput) => {
    const { workflow, events } = stuff;

    return {
      props: { workflow, events },
    };
  };
</script>

<script lang="ts">
  import { getVisibleEvents } from '$lib/utilities/get-visible-events';

  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';
  import EventTable from '$lib/components/event-table.svelte';

  let category: EventTypeCategory = null;

  export let workflow: WorkflowExecution;
  export let events: HistoryEventWithId[];

  const eventsAndActivities = getVisibleEvents(events, workflow, category);
</script>

{#await eventsAndActivities then events}
  <EventTable {events}>
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
{/await}
