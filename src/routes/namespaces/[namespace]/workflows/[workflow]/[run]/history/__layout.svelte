<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowParameters } from '$lib/utilities/route-for';

  export async function load({ page }: LoadInput) {
    const { workflow: workflowId, run: runId, namespace } = page.params;
    const parameters = { namespace, executionId: workflowId, runId };

    const events = await fetchEvents(parameters);

    return {
      props: {
        workflow: { workflowId, runId, namespace },
        parameters,
      },
    };
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import {
    faCode,
    faDownload,
    faLayerGroup,
    faStream,
  } from '@fortawesome/free-solid-svg-icons';

  import { routeFor } from '$lib/utilities/route-for';
  import { createDataUrl } from '$lib/utilities/create-data-url';
  import { fetchEvents } from '$lib/services/events-service';
  import { refreshable } from '$lib/stores/refreshable';

  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';

  export let workflow: WorkflowParameters;
  export let parameters: Parameters<typeof fetchEvents>[0];

  let events = refreshable(() => fetchEvents(parameters));
  $: setContext('events', $events);
</script>

<section class="flex flex-col gap-4">
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
      <ToggleButton icon={faDownload} href={createDataUrl(events)} />
    </div>
  </nav>
  <slot />
</section>
