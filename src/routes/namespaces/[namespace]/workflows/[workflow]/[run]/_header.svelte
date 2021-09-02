<script lang="ts">
  import { namespace } from '$lib/stores/namespace';
  import Icon, { X, ArrowLeft, ArrowRight } from 'svelte-hero-icons';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { isFullScreen } from '$lib/stores/full-screen';
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Tabs from './_tabs.svelte';

  export let workflow: WorkflowExecution;

  $: workflowUrl = getWorkflowExecutionUrl($namespace, workflow);
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
    <a href={`/namespaces/${$namespace}/workflows`}>
      <Icon src={X} class="absolute right-2 top-2 w-8 h-8 text-gray-400" />
    </a>
    <div class="flex m-0 mt-6 justify-between items-center">
      <h1 class="text-lg">
        {workflow.name}
      </h1>
      <span class="inline">
        <WorkflowStatus status={workflow.status} />
      </span>
    </div>
    <p class="text-gray-500 text-sm">
      <span class=" uppercase text-gray-400">Workflow ID</span>
      {workflow.id}
    </p>
    <p class="text-gray-500 text-xs">
      <span class=" uppercase text-gray-400">Run ID</span>
      {workflow.runId}
    </p>
  </main>
  <Tabs {workflow} />
</header>
