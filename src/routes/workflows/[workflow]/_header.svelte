<script lang="ts">
  import Icon, { X, ArrowsExpand, ArrowRight } from 'svelte-hero-icons';
  import { isFullScreen } from '$lib/stores/full-screen';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  export let workflow: WorkflowExecution;
</script>

<header
  class="border-b-2 border-gray-200 px-6 pb-6 flex flex-col justify-between"
>
  <a href={workflow.toggleUrl($isFullScreen)}>
    <Icon
      src={$isFullScreen ? ArrowRight : ArrowsExpand}
      class="absolute right-10 top-2 w-8 h-8 text-gray-400"
    />
  </a>
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
</header>
