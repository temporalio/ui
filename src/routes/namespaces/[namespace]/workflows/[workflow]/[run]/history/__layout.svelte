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
  import {
    faCode,
    faLayerGroup,
    faStream,
  } from '@fortawesome/free-solid-svg-icons';

  import { routeFor } from '$lib/utilities/route-for';
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';

  import ExportHistory from '$lib/components/export-history.svelte';
  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import PendingActivties from './_pending-activties.svelte';

  export let workflowParameters: WorkflowParameters;
  export let events: HistoryEventWithId[];

  const { input, result } = getWorkflowStartedAndCompletedEvents(events);
</script>

<section class="flex flex-col gap-4">
  <div class="flex gap-4">
    <CodeBlock heading="Input" content={input} framed />
    <CodeBlock heading="Result" content={result} framed />
  </div>
  <PendingActivties />
  <section id="event-history">
    <nav class="flex gap-4 justify-between items-end pb-4">
      <h3 class="text-lg font-medium">Event History</h3>
      <div class="flex gap-4">
        <ToggleButtons>
          <ToggleButton
            icon={faStream}
            href={routeFor('workflow.events.summary', workflowParameters)}
          />
          <ToggleButton
            icon={faLayerGroup}
            href={routeFor('workflow.events.compact', workflowParameters)}
          />
          <ToggleButton
            icon={faCode}
            href={routeFor('workflow.events.json', workflowParameters)}
          />
        </ToggleButtons>
        <ExportHistory />
      </div>
    </nav>
    <slot />
  </section>
</section>
