<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';
  import { namespace } from '$lib/stores/namespace';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import { routeFor } from '$lib/utilities/route-for';

  export let workflow: WorkflowExecution;
  export let timeFormat: TimeFormat;

  $: href = routeFor('workflow', {
    namespace: $namespace,
    workflowId: workflow.id,
    runId: workflow.runId,
  });
</script>

<a
  sveltekit:noscroll
  {href}
  class="row text-sm md:text-base block md:table-row border-b-2 items-center"
>
  <div class="cell">
    <div>
      <WorkflowStatus status={workflow.status} />
    </div>
  </div>
  <div class="cell links font-medium md:font-normal">
    {workflow.id}
  </div>
  <div class="cell links">
    <h3>
      {workflow.name}
    </h3>
  </div>
  <div class="inline-block  cell">
    <p>
      {formatDate(workflow.startTime, timeFormat)}
    </p>
  </div>
  <span class=" md:hidden"> - </span>
  <div class="inline-block cell">
    <p>
      {formatDate(workflow.endTime, timeFormat)}
    </p>
  </div>
</a>

<style lang="postcss">
  .row {
    @apply no-underline p-2;
  }

  .cell {
    @apply md:table-cell md:border-b-2 text-left p-2;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .row:hover .links {
    @apply underline text-blue-500;
  }
</style>
