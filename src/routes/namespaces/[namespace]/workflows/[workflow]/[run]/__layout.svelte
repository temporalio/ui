<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { fetchWorkflow } from '$lib/services/workflow-service';

  export const load: Load = async function ({ params }) {
    const { workflow: executionId, run: runId, namespace } = params;

    const parameters = {
      namespace,
      executionId,
      runId,
    };

    const workflow = await fetchWorkflow(parameters, fetch);

    return {
      props: { workflow, namespace },
      stuff: { workflow },
    };
  };
</script>

<script lang="ts">
  import Header from './_header.svelte';

  export let workflow: WorkflowExecution;
  export let namespace: string;
</script>

<main class="flex flex-col gap-6 h-full">
  <Header {namespace} {workflow} />
  <slot />
</main>
