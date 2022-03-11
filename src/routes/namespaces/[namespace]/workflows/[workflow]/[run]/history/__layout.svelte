<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { WorkflowParameters } from '$lib/utilities/route-for';

  import { fetchEvents } from '$lib/services/events-service';
  import { groupEvents } from '$lib/models/group-events';

  export const load: Load = async function ({ params, url, stuff }) {
    const { workflow } = stuff;
    const { workflow: workflowId, run: runId, namespace } = params;
    const parameters = { namespace, executionId: workflowId, runId };

    const events = await fetchEvents(parameters);
    const eventGroups = groupEvents(events);

    const category = url.searchParams.get('category');
    const view = (url.searchParams.get('view') as EventHistoryView) || 'full';

    return {
      props: {
        workflowParameters: { workflowId, runId, namespace },
        events,
        workflow,
        category,
        eventGroups,
        view,
      },
      stuff: {
        events,
        eventGroups,
      },
    };
  };
</script>

<script lang="ts">
  import {
    faCode,
    faLayerGroup,
    faStream,
  } from '@fortawesome/free-solid-svg-icons';

  import { routeFor } from '$lib/utilities/route-for';

  import { getVisibleEvents } from '$lib/utilities/get-visible-events';

  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import Option from '$lib/components/select/option.svelte';
  import EventTable from '$lib/components/event-table.svelte';

  import ExportHistory from '$lib/components/export-history.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import InputAndResults from '$lib/components/input-and-result.svelte';

  export let workflowParameters: WorkflowParameters;
  export let workflow: WorkflowExecution;
  export let events: HistoryEventWithId[];
  export let category: EventTypeCategory = null;
  export let view: EventHistoryView;

  $: visibleEvents = getVisibleEvents(events, workflow, category);
</script>

<section class="flex flex-col gap-4">
  <InputAndResults {events} />
  <nav class="flex gap-4 justify-between items-end">
    <h3 class="text-lg font-medium">Event History</h3>
    <div class="flex gap-4">
      <ToggleButtons>
        <ToggleButton
          icon={faStream}
          href={routeFor('workflow.events.full', workflowParameters)}
        />
        <!-- <ToggleButton
          icon={faLayerGroup}
          href={routeFor('workflow.events.compact', workflowParameters)}
        /> -->
        <ToggleButton
          icon={faCode}
          href={routeFor('workflow.events.json', workflowParameters)}
        />
      </ToggleButtons>
      <ExportHistory />
    </div>
  </nav>
  <EventTable events={visibleEvents}>
    <div slot="filters">
      {view}
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
</section>
