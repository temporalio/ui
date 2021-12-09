<script lang="ts">
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import { namespace } from '$lib/stores/namespace';
  import { page } from '$app/stores';
  import { getWorkflowExecutionUrl } from '$lib/utilities/get-workflow-execution-url';
  import { pathMatches } from '$lib/utilities/path-matches';
  import Time from '$lib/components/workflow-time.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  export let workflow: WorkflowExecution;
  export let timeFormat: string;

  $: href = getWorkflowExecutionUrl($namespace, workflow);
</script>

<article class="flex flex-row">
  <div>
    <a sveltekit:noscroll {href}>
      <h3>
        {workflow.name}
      </h3>
    </a>
  </div>
  <div>
    <a sveltekit:noscroll {href} class="workflow-id hover">
      {workflow.id}
    </a>
  </div>
  <div>
    <a sveltekit:noscroll {href}>
      <div>
        <WorkflowStatus status={workflow.status} />
      </div>
    </a>
  </div>
  <div>
    <a sveltekit:noscroll {href}>
      <Time time={workflow.startTime} {timeFormat} />
    </a>
  </div>
  <div>
    <a sveltekit:noscroll {href}>
      <Time time={workflow.endTime} {timeFormat} />
    </a>
  </div>
</article>

<style lang="postcss">
  .workflow-id {
    @apply m-0 text-gray-500 text-sm;
  }

  tr {
    @apply border-2 flex justify-between;
  }

  tr:hover {
    @apply bg-blue-100;
  }

  tr:hover .hover {
    @apply text-blue-400 underline;
  }

  td {
    @apply p-1 w-2/12;
  }

  a {
    @apply w-full h-full block no-underline p-2;
  }

  .active {
    @apply bg-yellow-200;
  }

  .active:hover {
    @apply bg-yellow-200;
  }
</style>
