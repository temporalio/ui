<script lang="ts">
  import { page } from '$app/stores';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import {
    customSearchAttributes,
    isCustomSearchAttribute,
    workflowIncludesSearchAttribute,
  } from '$lib/stores/search-attributes';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    isDataCell,
    isPathCell,
    type WorkflowHeader,
    WORKFLOW_CELLS,
  } from '$lib/stores/workflow-table-columns';
  import { formatDate } from '$lib/utilities/format-date';
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

  $: cell =
    label in WORKFLOW_CELLS ? WORKFLOW_CELLS[label] : { label, path: label };
  $: {
    if (isPathCell(cell)) {
      cellContent = workflow[cell.path] ?? '';
    } else if (isDataCell(cell)) {
      cellContent = cell.data(workflow, $timeFormat) ?? '';
    }
  }
</script>

{#if label === 'Status'}
  <td class="workflows-summary-table-body-cell">
    <WorkflowStatus status={workflow.status} />
  </td>
{:else if label === 'Type' || label === 'Workflow ID'}
  <td
    class="workflows-summary-table-body-cell relative"
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
{:else if isCustomSearchAttribute(label) && workflowIncludesSearchAttribute(workflow, label)}
  {@const content = workflow.searchAttributes.indexedFields[label]}
  <td class="workflows-summary-table-body-cell">
    {#if $customSearchAttributes[label] === 'Datetime'}
      {formatDate(content, $timeFormat)}
    {:else if $customSearchAttributes[label] === 'Bool'}
      <Badge>{content}</Badge>
    {:else}
      {content}
    {/if}
  </td>
{:else}
  <td class="workflows-summary-table-body-cell">{cellContent}</td>
{/if}

<style lang="postcss">
  .workflows-summary-table-body-cell {
    @apply whitespace-nowrap px-2 h-10 text-sm;
  }
</style>
