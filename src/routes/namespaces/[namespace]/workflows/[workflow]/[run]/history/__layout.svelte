<script context="module" lang="ts">
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ stuff, page }: LoadInput) {
    const { workflow, run: runId, namespace } = page.params;

    const path =
      getWorkflowExecutionUrl(namespace, { id: workflow, runId }) + '/history';

    return {
      props: {
        path,
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

  export let path: string;
</script>

<section class="flex flex-col gap-4">
  <section class="flex flex-col gap-4">
    <nav class="flex gap-4 justify-between items-end">
      <h3 class="text-lg font-semibold">Event History</h3>
      <div class="flex gap-4">
        <ToggleButtons>
          <ToggleButton icon={faStream} href="{path}/full" />
          <ToggleButton icon={faLayerGroup} href="{path}/compact" />
          <ToggleButton icon={faCode} href="{path}/json" />
        </ToggleButtons>
        <ToggleButton icon={faDownload} href="#no-implemented" />
      </div>
    </nav>
  </section>

  <slot />
</section>
