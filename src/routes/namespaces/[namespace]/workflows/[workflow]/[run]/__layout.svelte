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
      props: { workflow, namespace },
      stuff: { workflow, events },
    };
  }
</script>

<script lang="ts">
  import Header from './_header.svelte';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export let workflow: WorkflowExecution;
  export let namespace: string;
</script>

<section class="border-l-2 h-screen">
  <main class="w-full">
    <Header {workflow} {namespace} />
    <slot />
  </main>
</section>
