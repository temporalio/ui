<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { fetchWorkflowWithEventHistory } from '$lib/services/workflow-service';

  export async function load({ page }: LoadInput) {
    const { workflow: executionId, run: runId, namespace } = page.params;
    const { workflow, events } = await fetchWorkflowWithEventHistory({
      namespace,
      executionId,
      runId,
    });

    return {
      props: { workflow, namespace, executionId, runId },
      stuff: { workflow, events },
    };
  }
</script>

<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { onDestroy, onMount } from 'svelte';

  import Header from './_header.svelte';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import { routeForApi } from '$lib/utilities/route-for-api';

  export let workflow: WorkflowExecution;
  export let namespace: string;
  export let executionId: string;
  export let runId: string;

  let interval: NodeJS.Timer;
  onMount(() => {
    interval = setInterval(() => {
      console.log('invalidate');
      invalidate(routeForApi('events', { namespace, executionId, runId }));
    }, 5000);
  });
  onDestroy(() => clearInterval(interval));
</script>

<main class="flex flex-col gap-4 h-full">
  <Header {workflow} {namespace} />
  <slot />
</main>
