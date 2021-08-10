<script lang="ts">
  import Icon, { X, ArrowLeft, ArrowRight } from 'svelte-hero-icons';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import { isFullScreen } from '$lib/stores/full-screen';
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Tabs from './_tabs.svelte';

  export let workflow: WorkflowExecution;
  let workflowUrl = getWorkflowExecutionUrl(workflow);
</script>

<header class="flex flex-col justify-between">
  <main class="px-6">
    {#if $isFullScreen}
      <a href={workflowUrl}>
        <Icon
          src={ArrowRight}
          class="absolute right-10 top-2 w-8 h-8 text-gray-400"
        />
      </a>
    {:else}
      <a href={workflowUrl + '/summary'}>
        <Icon
          src={ArrowLeft}
          class="absolute right-10 top-2 w-8 h-8 text-gray-400"
        />
      </a>
    {/if}
    <a href="/workflows">
      <Icon src={X} class="absolute right-2 top-2 w-8 h-8 text-gray-400" />
    </a>
    <h1 class="m-0 mt-6 text-lg">
      {workflow.name}
    </h1>
    <p class="text-gray-500 text-sm">
      {workflow.id}
    </p>
    <p class="text-gray-500 text-sm">
      {workflow.runId}
    </p>
    <div class="mt-4"><WorkflowStatus status={workflow.status} /></div>
  </main>
  <Tabs {workflow} />
</header>
