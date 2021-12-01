<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { fetchEvents } from '$lib/services/events-service';

  export async function load({ page }: LoadInput) {
    const { workflow: executionId, run: runId, namespace } = page.params;
    const workflow = await fetchWorkflow({ namespace, executionId, runId });
    const events = await fetchEvents({ namespace, executionId, runId });

    return {
      props: { workflow },
      stuff: { workflow, events: events.history.events },
    };
  }
</script>

<script lang="ts">
  import Header from './_header.svelte';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export let workflow: WorkflowExecution;
</script>

<section class="border-l-2 h-screen">
  <main class="w-full">
    <Header {workflow} />
    <slot />
  </main>
</section>
