<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ stuff }: LoadInput) {
    const { events } = stuff as {
      events: HistoryEventWithId[];
    };

    return {
      props: {
        events,
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

  let category: EventTypeCategory = null;

  $: visibleEvents = events.filter(eventTypeInCategory(category));
</script>

<EventTable events={visibleEvents}>
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
  <div slot="details" class="w-full h-full">
    <slot />
  </div>
</EventTable>
