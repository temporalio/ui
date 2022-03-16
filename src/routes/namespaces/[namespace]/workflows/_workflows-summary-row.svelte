<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';
  import { namespace } from '$lib/stores/namespace';

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

<article class="row">
  <div class="cell">
    <div>
      <WorkflowStatus status={workflow.status} />
    </div>
  </div>
  <div class="cell links font-medium md:font-normal">
    <a {href} class="underline">{workflow.id}</a>
  </div>
  <div class="cell links">
    <h3>
      <a {href} class="underline">{workflow.name}</a>
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
</article>

<style lang="postcss">
  .row {
    @apply no-underline p-2 text-sm border-b-2 items-center md:text-base md:table-row;
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
