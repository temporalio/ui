<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  import Link from '$lib/components/link.svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let timeFormat: TimeFormat;

  $: href = routeForWorkflow({
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  });
</script>

<article class="row">
  <div class="cell">
    <div>
      <WorkflowStatus status={workflow.status} />
    </div>
  </div>
  <div class="cell links font-medium md:font-normal">
    <Link {href}>{workflow.id}</Link>
  </div>
  <div class="cell links">
    <h3>
      <Link {href}>{workflow.name}</Link>
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
</style>
