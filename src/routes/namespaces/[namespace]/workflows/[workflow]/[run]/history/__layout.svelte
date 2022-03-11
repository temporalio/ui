<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { WorkflowParameters } from '$lib/utilities/route-for';

  import { fetchEvents } from '$lib/services/events-service';

  export const load: Load = async function ({ params, url, stuff }) {
    const { workflow: workflowId, run: runId, namespace } = params;
    const parameters = { namespace, executionId: workflowId, runId };

    const { events, eventGroups } = await fetchEvents(parameters);

    return {
      props: {
        workflowParameters: { workflowId, runId, namespace },
        events,
        eventGroups,
      },
      stuff: {
        events,
        eventGroups,
      },
    };
  };
</script>

<script lang="ts">
  import { faCode, faStream } from '@fortawesome/free-solid-svg-icons';

  import { routeFor } from '$lib/utilities/route-for';

  import EventTable from '$lib/components/event-table.svelte';

  import ExportHistory from '$lib/components/export-history.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import InputAndResults from '$lib/components/input-and-result.svelte';

  export let workflowParameters: WorkflowParameters;
  export let events: HistoryEventWithId[];
  export let eventGroups: CompactEventGroups;

  let isCompact = false;

  $: visibleEvents = isCompact ? eventGroups : events;
</script>

<section class="flex flex-col gap-4 max-h-screen">
  <InputAndResults {events} />
  <section id="event-history">
    <nav class="flex gap-4 justify-between items-end">
      <h3 class="text-lg font-medium">Event History</h3>
      <div class="flex gap-4">
        <ToggleButtons>
          <ToggleButton
            icon={faStream}
            href={routeFor('workflow.events.full', workflowParameters)}
          />
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
        <div>
          <input
            type="checkbox"
            id="event-history-view"
            bind:checked={isCompact}
          />
          <label for="event-history-view">Show compact view</label>
        </div>
      </div>
      <div slot="details" class="w-full h-full py-4">
        <slot />
      </div>
    </EventTable>
  </section>
</section>
