<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';

  export async function load({ stuff, page }: LoadInput) {
    const { workflow: id, run: runId, namespace } = page.params;
    const { workflow, events } = stuff as {
      workflow: WorkflowExecution;
      events: HistoryEventWithId[];
    };

    const path =
      getWorkflowExecutionUrl(namespace, { id, runId }) + '/history/full';

    return {
      props: {
        events,
        pendingActivities: workflow.pendingActivities,
        path,
      },
    };
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';

  import { eventTypeInCategory } from '$lib/utilities/get-event-categorization';

  import Event from '$lib/components/event.svelte';
  import VirtualList from '@sveltejs/svelte-virtual-list';
  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';

  export let events: HistoryEventWithId[];
  export let pendingActivities: PendingActivity[];
  export let path: string;

  let category: EventTypeCategory = null;

  setContext('path', path);

  $: visibleEvents = events.filter(eventTypeInCategory(category));
  $: eventsAndActivities = [...pendingActivities, ...visibleEvents];
</script>

<section
  class="flex flex-col border-2 border-gray-300 rounded-lg w-full event-history"
>
  <div class="flex w-full">
    <header class="table-header border-r-2 rounded-tl-lg w-1/3">
      <h3>Summary</h3>
      <div>
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
    </header>
    <header class="table-header rounded-tr-lg w-2/3">
      <h3>Details</h3>
    </header>
  </div>
  <div class="flex h-full overflow-y-hidden">
    <div
      class="flex flex-col h-full w-1/3 border-r-2 border-gray-300 rounded-bl-lg"
    >
      <div class="h-full rounded-bl-lg overflow-y-scroll">
        <VirtualList items={eventsAndActivities} let:item>
          <Event event={item} />
        </VirtualList>
      </div>
    </div>
    <div class="flex flex-col h-full w-2/3">
      <div
        class="h-full  overflow-y-scroll overflow-x-hidden rounded-br-lg px-4"
      >
        <slot />
      </div>
    </div>
  </div>
</section>

<style lang="postcss">
  .event-history {
    height: calc(100vh - 360px);
  }

  .table-header {
    @apply bg-gray-100 text-gray-800 font-semibold p-4 border-b-2 flex justify-between items-center;
  }
</style>
