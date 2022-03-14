<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';
  import type { WorkflowParameters } from '$lib/utilities/route-for';

  import { fetchEvents } from '$lib/services/events-service';

  export const load: Load = async function ({ params }) {
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

  import Event from '$lib/components/event.svelte';
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

<section class="flex flex-col gap-4">
  <InputAndResults {events} />
  <section id="event-history">
    <nav class="flex gap-4 justify-between items-end pb-4">
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
    <section
      class="flex flex-col border-2 border-gray-300 rounded-lg w-full mb-6"
    >
      <div class="flex w-full">
        <header class="table-header border-r-2 rounded-tl-lg w-1/3">
          <h3>Summary</h3>
          <div>
            <input
              type="checkbox"
              id="event-history-view"
              bind:checked={isCompact}
            />
            <label for="event-history-view">Show compact view</label>
          </div>
        </header>
        <header class="table-header rounded-tr-lg w-2/3">
          <h3>Details</h3>
        </header>
      </div>
      <div class="flex overflow-y-hidden">
        <div
          class="flex flex-col w-1/3 border-r-2 border-gray-300 rounded-bl-lg"
        >
          <div class="rounded-bl-lg overflow-y-scroll">
            {#each visibleEvents as event (event.id)}
              <Event {event} />
            {/each}
          </div>
        </div>
        <div class="flex flex-col w-2/3">
          <div
            class="overflow-y-scroll overflow-x-hidden rounded-br-lg px-4 w-full py-4"
          >
            <slot />
          </div>
        </div>
      </div>
    </section>
  </section>
</section>

<style lang="postcss">
  .table-header {
    @apply bg-gray-100 text-gray-800 font-semibold p-4 flex justify-between items-center border-b-2;
  }
</style>
