<script lang="ts">
  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import TerminateWorkflow from '$lib/components/terminate-workflow.svelte';
  import Tabs from './_tabs.svelte';

  export let workflow: WorkflowExecution;
  export let namespace: string;
</script>

<header class="flex flex-col justify-between">
  <main class="px-6 mb-2">
    <div class="flex m-0 mt-6 justify-between items-center">
      <h1 class="text-lg">
        <a href={`/namespaces/${namespace}/workflows`}>
          <i
            class="fas fa-arrow-left inline w-5 h-5 text-gray-500 cursor-pointer"
          />
        </a>
        {workflow.name}
        <span class="inline">
          <WorkflowStatus status={workflow?.status} />
        </span>
      </h1>
      <TerminateWorkflow {workflow} {namespace} />
    </div>
    <p class="text-gray-500 text-xs">
      <span class="uppercase text-gray-400 mr-2">Workflow ID</span>
      {workflow.id}
    </p>
  </main>
  <Tabs {workflow} />
</header>

<style lang="postcss">
  p {
    @apply ml-6;
  }
</style>
