<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { page } from '$app/stores';

  import WorkflowFilters from '$lib/components/workflow/workflow-filters.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import { translate } from '$lib/i18n/translate';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { workflowsSearchParams } from '$lib/stores/workflows';
  import {
    loading,
    refresh,
    updating,
    workflowError,
    workflows,
  } from '$lib/stores/workflows';
  import { getSearchType } from '$lib/utilities/search-type-parameter';

  let searchType: 'basic' | 'advanced' = getSearchType($page.url);

  const errorMessage =
    searchType === 'advanced'
      ? 'Please check your syntax and try again.'
      : 'If you have filters applied, try adjusting them.';

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
  });

  const refreshWorkflows = () => {
    $refresh = Date.now();
  };

  onDestroy(() => {
    $workflowsSearchParams = $page.url.searchParams.toString();
  });
</script>

<header class="mb-2 flex items-center justify-between">
  <div>
    <h1 class="text-2xl" data-testid="namespace-title">
      {translate('workflows', 'recent-workflows')}
    </h1>
    <div class="flex items-center gap-2 text-sm">
      <p data-testid="namespace-name">
        {$page.params.namespace}
      </p>
    </div>
  </div>
  <div>
    <IconButton
      label={translate('workflows', 'retry-workflows')}
      icon="retry"
      on:click={refreshWorkflows}
    />
  </div>
</header>
<WorkflowFilters bind:searchType />
<Pagination
  items={$workflows}
  let:visibleItems
  aria-label={translate('workflows', 'recent-workflows')}
  pageSizeSelectLabel={translate('per-page')}
  previousButtonLabel={translate('previous')}
  nextButtonLabel={translate('next')}
>
  <WorkflowsSummaryTable updating={$updating}>
    {#each visibleItems as event}
      <WorkflowsSummaryRow
        workflow={event}
        namespace={$page.params.namespace}
      />
    {:else}
      <tr>
        <td colspan="5" class="xl:hidden">
          {#if $loading}
            <Loading />
          {:else}
            <EmptyState
              title="No Workflows Found"
              content={errorMessage}
              error={$workflowError}
            />
          {/if}
        </td>
        <td colspan="7" class="hidden xl:table-cell">
          {#if $loading}
            <Loading />
          {:else}
            <EmptyState
              title="No Workflows Found"
              content={errorMessage}
              error={$workflowError}
            />
          {/if}
        </td>
      </tr>
    {/each}
  </WorkflowsSummaryTable>
</Pagination>
