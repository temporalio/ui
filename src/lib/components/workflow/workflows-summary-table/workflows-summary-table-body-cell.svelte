<script lang="ts">
  import { page } from '$app/stores';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    isDataCell,
    isPathCell,
    type WorkflowHeader,
    WORKFLOW_CELLS,
  } from '$lib/stores/workflow-table-columns';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';

  export let column: WorkflowHeader;
  export let workflow: WorkflowExecution;

  $: ({ label } = column);

  let cellContent: string;
  let filterOrCopyButtonsVisible: boolean = false;

  const showFilterOrCopy = () => (filterOrCopyButtonsVisible = true);
  const hideFilterOrCopy = () => (filterOrCopyButtonsVisible = false);

  const onRowFilterClick = (header: WorkflowHeader, value: string) => {
    const attribute =
      header.label === 'Workflow ID' ? 'WorkflowId' : 'WorkflowType';
    const filter = $workflowFilters.find((f) => f.attribute === attribute);
    const getOtherFilters = () =>
      $workflowFilters.filter((f) => f.attribute !== attribute);

    if (!filter) {
      const newFilter = {
        attribute,
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), newFilter];
    } else {
      $workflowFilters = [...getOtherFilters()];
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };

  $: cell = WORKFLOW_CELLS[label];
  $: {
    if (isPathCell(cell)) {
      cellContent = workflow[cell.path] ?? '';
    } else if (isDataCell(cell)) {
      cellContent = cell.data(workflow, $timeFormat) ?? '';
    }
  }
</script>

{#if label === 'Status'}
  <td>
    <WorkflowStatus status={workflow.status} />
  </td>
{:else if label === 'Search Attributes' || label === 'Custom Search Attributes'}
  <td>
    <Badge type="default">
      {cellContent}
    </Badge>
  </td>
{:else if label === 'Type' || label === 'Workflow ID'}
  <td
    class="relative"
    on:mouseover={showFilterOrCopy}
    on:focus={showFilterOrCopy}
    on:mouseleave={hideFilterOrCopy}
    on:blur={hideFilterOrCopy}
  >
    <span class="table-link">{cellContent}</span>
    <FilterOrCopyButtons
      show={filterOrCopyButtonsVisible}
      content={cellContent}
      onFilter={() => onRowFilterClick(column, cellContent)}
      filtered={$workflowFilters.some(
        (filter) => filter.attribute === label && filter.value === cellContent,
      )}
    />
  </td>
{:else if label === 'Memo' || label === 'Memo Custom Key'}
  <td>
    <CodeBlock content={cellContent} inline copyable={false} />
  </td>
{:else}
  <td>{cellContent}</td>
{/if}
