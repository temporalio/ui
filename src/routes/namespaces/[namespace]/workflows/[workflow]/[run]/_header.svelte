<script lang="ts">
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import Tabs from './_tabs.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  export let workflow: WorkflowExecution;
  export let loading: boolean;
</script>

<header class="flex flex-col justify-between">
  {#if !loading}
    <main class="px-6">
      <div class="flex m-0 mt-6 justify-between items-center">
        <h1 class="text-lg">
          {workflow.name}
        </h1>
        <span class="inline">
          <WorkflowStatus status={workflow?.status} />
        </span>
      </div>
      <p class="text-gray-500 text-xs">
        <span class="uppercase text-gray-400 mr-2">Workflow ID</span>
        {workflow.id}
      </p>
      <p class="text-gray-500 text-xs">
        <span class="uppercase text-gray-400 mr-2">Run ID</span>
        {workflow.runId}
      </p>
    </main>
  {/if}
  <Tabs />
</header>
