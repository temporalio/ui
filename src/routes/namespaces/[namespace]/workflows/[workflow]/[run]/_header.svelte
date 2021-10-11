<script lang="ts">
  import { namespace } from '$lib/stores/namespace';
  import Icon from 'svelte-hero-icons/Icon.svelte';
  import { X, ArrowLeft, ArrowRight } from 'svelte-hero-icons';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { isFullScreen } from '$lib/stores/full-screen';
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Tabs from './_tabs.svelte';

  export let workflow: WorkflowExecution;

  $: workflowUrl = getWorkflowExecutionUrl($namespace, workflow);
</script>

<header class="flex flex-col justify-between">
  <div class="py-4 px-2 bg-gray-50 border-b-2 border-gray-100 flex justify-end">
    {#if $isFullScreen}
      <a href={workflowUrl}>
        <Icon src={ArrowRight} class="w-8 h-8 text-gray-500" />
      </a>
    {:else}
      <a href={workflowUrl + '/summary'}>
        <Icon src={ArrowLeft} class="w-8 h-8 text-gray-500" />
      </a>
    {/if}
    <a href={`/namespaces/${$namespace}/workflows`}>
      <Icon src={X} class="w-8 h-8 text-gray-500" />
    </a>
  </div>
  <main class="px-6">
    <div class="flex m-0 mt-6 justify-between items-center">
      <h1 class="text-lg">
        {workflow.name}
      </h1>
      <span class="inline">
        <WorkflowStatus status={workflow.status} />
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
  <Tabs {workflow} />
</header>
