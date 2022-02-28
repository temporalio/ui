<script lang="ts" context="module">
  import type { LoadInput } from '@sveltejs/kit';

  export const load = async ({ stuff, page }: LoadInput) => {
    const { workflow, events } = stuff;
    const category = page.query.get('category');

    return {
      props: { workflow, events, category },
    };
  };
</script>

<script lang="ts">
  import { getVisibleEvents } from '$lib/utilities/get-visible-events';

  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';
  import EventTable from '$lib/components/event-table.svelte';

  export let workflow: WorkflowExecution;
  export let events: HistoryEventWithId[];
  export let category: EventTypeCategory = null;

  $: visibleEvents = getVisibleEvents(events, workflow, category);
</script>

<EventTable events={visibleEvents}>
  <div slot="filters">
    <FilterSelect parameter="category" bind:value={category}>
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
