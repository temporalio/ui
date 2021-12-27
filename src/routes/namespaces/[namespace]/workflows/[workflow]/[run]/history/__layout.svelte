<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowParameters } from '$lib/utilities/route-for';

  export async function load({ page }: LoadInput) {
    const { workflow: workflowId, run: runId, namespace } = page.params;

    return {
      props: {
        workflow: { workflowId, runId, namespace },
      },
    };
  }
</script>

<script lang="ts">
  import {
    faCode,
    faDownload,
    faLayerGroup,
    faStream,
  } from '@fortawesome/free-solid-svg-icons';

  import ToggleButton from '$lib/components/toggle-button.svelte';
  import ToggleButtons from '$lib/components/toggle-buttons.svelte';
  import { routeFor } from '$lib/utilities/route-for';

  export let workflow: WorkflowParameters;
</script>

<section class="flex flex-col gap-4">
  <nav class="flex gap-4 justify-between items-end">
    <h3 class="text-lg font-semibold">Event History</h3>
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
      <ToggleButton icon={faDownload} href="#no-implemented" />
    </div>
  </nav>
</section>

<slot />
