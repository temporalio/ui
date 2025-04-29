<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatDate } from '$lib/utilities/format-date';
  import { getMilliseconds } from '$lib/utilities/format-time';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let namespace: string;
  export let workflow: WorkflowExecution;

  $: href = routeForEventHistory({
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
    });
  };
</script>

<TableRow class="hover:bg-interactive-table-hover">
  <td>
    <WorkflowStatus
      status={workflow.status}
      delay={getMilliseconds(workflow.startTime)}
    />
  </td>
  <td
    class="relative pr-4 break-words"
    on:mouseover={() => (showFilterCopy = true)}
    on:focus={() => (showFilterCopy = true)}
    on:mouseleave={() => (showFilterCopy = false)}
    on:blur={() => (showFilterCopy = false)}
  >
    <Link {href}>
      {workflow.id}
    </Link>
    <FilterOrCopyButtons
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      filterIconTitle={translate('common.filter-workflows')}
      show={showFilterCopy}
      content={workflow.id}
      filterable={false}
    />
    <p class="inline-time-cell">
      {formatDate(workflow.startTime, $timeFormat, { relative: $relativeTime })}
    </p>
  </td>
  <td
    class="relative truncate"
    on:mouseover={() => (showFilterCopy = true)}
    on:focus={() => (showFilterCopy = true)}
    on:mouseleave={() => (showFilterCopy = false)}
    on:blur={() => (showFilterCopy = false)}
  >
    <h3 class="md:hidden">{translate('workflows.workflow-name')}:</h3>
    <button
      class="table-link"
      on:click|preventDefault|stopPropagation={() => onTypeClick(workflow.name)}
      aria-label={translate('workflows.filter-by', {
        workflowName: workflow.name,
      })}
    >
      {workflow.name}
    </button>
    <FilterOrCopyButtons
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
      filterIconTitle={translate('common.filter-workflows')}
      show={showFilterCopy}
      content={workflow.name}
      onFilter={() => onTypeClick(workflow.name)}
      filtered={$page.url?.searchParams?.get('query')?.includes(workflow.name)}
    />
    <p class="inline-time-cell">
      {formatDate(workflow.endTime, $timeFormat, { relative: $relativeTime })}
    </p>
  </td>
  <td class="time-cell">
    <p>
      {formatDate(workflow.startTime, $timeFormat, { relative: $relativeTime })}
    </p>
  </td>
  <td class="time-cell">
    <p>
      {formatDate(workflow.endTime, $timeFormat, { relative: $relativeTime })}
    </p>
  </td>
</TableRow>

<style lang="postcss">
  @reference "tailwindcss";

  .time-cell {
    @apply max-xl:hidden;
  }

  .inline-time-cell {
    @apply hidden md:block xl:hidden;
  }
</style>
