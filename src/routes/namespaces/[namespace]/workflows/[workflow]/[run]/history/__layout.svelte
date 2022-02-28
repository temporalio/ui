<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowParameters } from '$lib/utilities/route-for';

  import { fetchEvents } from '$lib/services/events-service';

  export async function load({ page }: LoadInput) {
    const { workflow: workflowId, run: runId, namespace } = page.params;
    const parameters = { namespace, executionId: workflowId, runId };

    const events = await fetchEvents(parameters);

    return {
      props: {
        workflow: { workflowId, runId, namespace },
        events,
      },
      stuff: {
        events,
      },
    };
  }
</script>

<script lang="ts">
  import {
    faCode,
    faLayerGroup,
    faStream,
  } from '@fortawesome/free-solid-svg-icons';

  import { routeFor } from '$lib/utilities/route-for';

  import ExportHistory from '$lib/components/export-history.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import InputAndResults from '$lib/components/input-and-result.svelte';

  export let workflow: WorkflowParameters;
  export let events: HistoryEventWithId[];
</script>

<section class="flex flex-col gap-4">
  <InputAndResults {events} />
  <nav class="flex gap-4 justify-between items-end">
    <h3 class="text-lg font-medium">Event History</h3>
    <div class="flex gap-4">
      <ToggleButtons>
        <ToggleButton
          icon={faStream}
          href={routeFor('workflow.events.full', workflow)}
        />
        <ToggleButton
          icon={faLayerGroup}
          href={routeFor('workflow.events.compact', workflow)}
        />
        <ToggleButton
          icon={faCode}
          href={routeFor('workflow.events.json', workflow)}
        />
      </ToggleButtons>
      <ExportHistory />
    </div>
  </nav>
  <slot />
</section>
