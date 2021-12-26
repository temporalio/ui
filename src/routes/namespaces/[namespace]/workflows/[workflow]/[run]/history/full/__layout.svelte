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

  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';
  import EventTable from '$lib/components/event-table.svelte';

  export let events: HistoryEventWithId[];
  export let pendingActivities: PendingActivity[];
  export let path: string;

  let category: EventTypeCategory = null;

  setContext('path', path);

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
  <div slot="details" class="w-full h-full">
    <slot />
  </div>
</EventTable>
