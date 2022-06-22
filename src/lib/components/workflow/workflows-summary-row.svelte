<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import { formatDate, getMilliseconds } from '$lib/utilities/format-date';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import { noop } from 'svelte/internal';
  export let namespace: string;
  export let workflow: WorkflowExecution;
  export let timeFormat: TimeFormat | string;

  $: href = routeForWorkflow({
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  });

  let showFilterCopy = false;

  const onTypeClick = (type: string) => {
    const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
    const query = $page.url.searchParams.get('query');
    const parameters = toListWorkflowParameters(query ?? defaultQuery);
    const workflowType = parameters?.workflowType === type ? '' : type;
    const value = toListWorkflowQuery({
      ...parameters,
      workflowType,
    });
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value,
      allowEmpty: true,
      goto,
    });
  };
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
  <div
    class="cell links relative truncate font-medium md:font-normal"
    on:mouseover={() => (showFilterCopy = true)}
    on:focus={() => (showFilterCopy = true)}
    on:mouseleave={() => (showFilterCopy = false)}
    on:blur={() => (showFilterCopy = false)}
  >
    <span class="table-link">{workflow.id}</span>
    <FilterOrCopyButtons
      show={showFilterCopy}
      content={workflow.id}
      filterable={false}
    />
    <p class="time-cell-inline">
      {formatDate(workflow.startTime, timeFormat)}
    </p>
  </div>
  <div
    class="cell links relative flex items-center justify-between gap-2 truncate font-medium md:font-normal"
    on:mouseover={() => (showFilterCopy = true)}
    on:focus={() => (showFilterCopy = true)}
    on:mouseleave={() => (showFilterCopy = false)}
    on:blur={() => (showFilterCopy = false)}
    on:click|preventDefault|stopPropagation={noop}
  >
    <h3 class="md:hidden">Workflow Name:</h3>
    <span
      class="table-link"
      on:click|preventDefault|stopPropagation={() => onTypeClick(workflow.name)}
      >{workflow.name}</span
    >
    <FilterOrCopyButtons
      show={showFilterCopy}
      content={workflow.name}
      onFilter={() => onTypeClick(workflow.name)}
      filtered={$page.url?.searchParams?.get('query')?.includes(workflow.name)}
    />
    <p class="time-cell-inline">
      {formatDate(workflow.endTime, timeFormat)}
    </p>
  </div>
  <div class="time-cell font-normal">
    <p>
      {formatDate(workflow.startTime, timeFormat)}
    </p>
  </div>
  <span class="md:hidden"> - </span>
  <div class="time-cell font-medium md:font-normal">
    <p>
      {formatDate(workflow.endTime, timeFormat)}
    </p>
  </div>
</a>

<style lang="postcss">
  .row {
    @apply block items-center border-b-2 p-2 text-sm no-underline last-of-type:border-b-0 md:table-row md:text-base;
  }

  .time-cell {
    @apply inline-block p-2 text-left md:hidden md:border-b-2 xl:table-cell;
  }

  .time-cell-inline {
    @apply mt-2 hidden md:block xl:hidden;
  }

  .cell {
    @apply p-2 text-left md:table-cell md:border-b-2;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .table-link {
    @apply group-hover:text-blue-700 group-hover:underline group-hover:decoration-blue-700;
  }

  .row:last-of-type .cell,
  .row:last-of-type .time-cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
