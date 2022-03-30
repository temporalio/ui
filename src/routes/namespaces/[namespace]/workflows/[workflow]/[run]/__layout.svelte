<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { getPollers } from '$lib/services/pollers-service';
  import type { GetPollersResponse } from '$lib/services/pollers-service';

  export const load: Load = async function ({ params, fetch }) {
    const { workflow: workflowId, run: runId, namespace } = params;

    const parameters = {
      namespace,
      workflowId,
      runId,
    };

    const workflow = await fetchWorkflow(parameters, fetch);
    const { taskQueue } = workflow;
    const workers = await getPollers({ queue: taskQueue, namespace });

    return {
      props: { workflow, namespace, workers },
      stuff: { workflow, workers },
    };
  };
</script>

<script lang="ts">
  import Header from './_header.svelte';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let workers: GetPollersResponse;
</script>

<main class="flex flex-col gap-6 h-full">
  <Header {namespace} {workflow} {workers} />
  <slot />
</main>
