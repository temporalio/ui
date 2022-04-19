<script lang="ts">
  import { formatDate, getMilliseconds } from '$lib/utilities/format-date';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Copyable from '$lib/components/copyable.svelte';
  import Tooltip from '$lib/components/tooltip.svelte';

  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let timeFormat: TimeFormat;

  $: href = routeForWorkflow({
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  });
</script>

<a {href} class="row group">
  <div class="cell">
    <div>
      <WorkflowStatus
        status={workflow.status}
        delay={getMilliseconds(workflow.startTime)}
      />
    </div>
  </div>
  <div class="cell overflow-cell links font-medium md:font-normal">
    <Tooltip bottom copyable text={workflow.id}>
      <span class="table-link">{workflow.id}</span>
    </Tooltip>
  </div>
  <div class="cell links font-medium md:font-normal flex gap-2">
    <h3 class="md:hidden">Workflow Name:</h3>
    <Copyable content={workflow.name} size="xs">
      <span class="table-link">{workflow.name}</span>
    </Copyable>
  </div>
  <div class="inline-block cell font-normal">
    <p>
      {formatDate(workflow.startTime, timeFormat)}
    </p>
  </div>
  <span class="md:hidden"> - </span>
  <div class="inline-block cell font-normal">
    <p>
      {formatDate(workflow.endTime, timeFormat)}
    </p>
  </div>
</a>

<style lang="postcss">
  .row {
    @apply block no-underline p-2 text-sm border-b-2 items-center md:text-base md:table-row last-of-type:border-b-0;
  }

  .cell {
    @apply md:table-cell md:border-b-2 text-left p-2;
  }

  .overflow-cell {
    @apply whitespace-nowrap text-ellipsis;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .table-link {
    @apply border-b-2 group-hover:text-blue-700 group-hover:border-blue-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
