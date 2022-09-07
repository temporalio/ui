<script>import { page } from '$app/stores';
import { timeFormat } from '../stores/time-format';
import { workflowsSearch } from '../stores/workflows';
import { refresh, workflows, loading, updating, workflowError, } from '../stores/workflows';
import { lastUsedNamespace } from '../stores/namespaces';
import { getSearchType } from '../utilities/search-type-parameter';
import { toListWorkflowParameters } from '../utilities/query/to-list-workflow-parameters';
import EmptyState from '../holocene/empty-state.svelte';
import Pagination from '../holocene/pagination.svelte';
import WorkflowsSummaryTable from '../components/workflow/workflows-summary-table.svelte';
import WorkflowsSummaryRow from '../components/workflow/workflows-summary-row.svelte';
import WorkflowFilters from '../components/workflow/workflow-filters.svelte';
import { onDestroy, onMount } from 'svelte';
import NamespaceSelector from '../holocene/namespace-selector.svelte';
import Loading from '$holocene/loading.svelte';
import PageTitle from '../holocene/page-title.svelte';
import Button from '../holocene/button.svelte';
import Icon from '$holocene/icon/icon.svelte';
let searchType = getSearchType($page.url);
const errorMessage = searchType === 'advanced'
    ? 'Please check your syntax and try again.'
    : 'If you have filters applied, try adjusting them.';
onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
});
const refreshWorkflows = () => {
    $refresh = Date.now();
};
onDestroy(() => {
    const query = $page.url.searchParams.get('query');
    const parameters = query ? toListWorkflowParameters(query) : {};
    $workflowsSearch = { parameters, searchType };
});
</script>

<PageTitle
  title={`Workflows | ${$page.params?.namespace}`}
  url={$page.url.href}
/>
<div class="flex justify-between">
  <div>
    <h1 class="text-2xl" data-cy="namespace-title">
      Recent Workflows
      <NamespaceSelector />
    </h1>
    <p class="text-sm text-gray-600" data-cy="namespace-name">
      {$page.params.namespace}
    </p>
  </div>
  <div>
    <Button variant="secondary" on:click={refreshWorkflows}
      ><Icon name="retry" /></Button
    >
  </div>
</div>
<WorkflowFilters bind:searchType />
{#if $loading}
  <Loading />
{:else if $workflows.length}
  <Pagination items={$workflows} updating={$updating} let:visibleItems>
    <WorkflowsSummaryTable>
      {#each visibleItems as event}
        <WorkflowsSummaryRow
          workflow={event}
          namespace={$page.params.namespace}
          timeFormat={$timeFormat}
        />
      {/each}
    </WorkflowsSummaryTable>
  </Pagination>
{:else}
  <EmptyState
    title={'No Workflows Found'}
    content={errorMessage}
    error={$workflowError}
  />
{/if}
