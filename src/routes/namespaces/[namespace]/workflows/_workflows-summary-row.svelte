<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  import TableLink from '$lib/components/table-link.svelte';

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
    <p>
      <TableLink {href}>{workflow.id}</TableLink>
    </p>
  </div>
  <div class="cell links font-medium md:font-normal">
    <p>
      <TableLink {href}>{workflow.name}</TableLink>
    </p>
  </div>
  <div class="inline-block cell font-normal">
    <p>
      {formatDate(workflow.startTime, timeFormat)}
    </p>
  </div>
  <span class=" md:hidden"> - </span>
  <div class="inline-block cell font-normal">
    <p>
      {formatDate(workflow.endTime, timeFormat)}
    </p>
  </div>
</article>

<style lang="postcss">
  .row {
    @apply no-underline p-2 text-sm border-b-2 items-center md:text-base md:table-row last-of-type:border-b-0;
  }

  .cell {
    @apply md:table-cell md:border-b-2 text-left p-2;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .row:hover :global(.table-link) {
    @apply text-blue-700 border-b-2 border-blue-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
