<script lang="ts">
  import { page } from '$app/stores';
  import FilterOrCopyButtons from '$lib/holocene/filter-or-copy-buttons.svelte';
  import {
    type TextFilterAttributes,
    searchAttributeToWorkflowKey,
  } from '$lib/models/workflow-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let attribute: TextFilterAttributes;
  export let workflow: WorkflowExecution;
  export let filterOrCopyButtonsVisible: boolean = false;

  $: value = workflow[searchAttributeToWorkflowKey[attribute]];
  $: namespace = $page.params.namespace;
  $: href = routeForEventHistory({
    namespace,
    workflow: workflow.id,
    run: workflow.runId,
  });

  const onRowFilterClick = () => {
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

    updateQueryParamsFromFilter($page.url, $workflowFilters);
  };
</script>

<a {href} class="table-link">{value}</a>
<FilterOrCopyButtons
  show={filterOrCopyButtonsVisible}
  content={value}
  onFilter={onRowFilterClick}
  filtered={$workflowFilters.some(
    (filter) => filter.attribute === attribute && filter.value === value,
  )}
/>
