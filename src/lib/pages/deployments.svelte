<script lang="ts">
  import { page } from '$app/state';

  import DeploymentTableRow from '$lib/components/deployments/deployment-table-row.svelte';
  import WorkersDeploymentsEmptyState from '$lib/components/workers/workers-deployments-empty-state.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedDeployments } from '$lib/services/deployments-service';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';

  let error = $state('');
  let search = $state('');

  const namespace = $derived(page.params.namespace);

  const onFetch = $derived.by(() => {
    return () => {
      error = '';
      return fetchPaginatedDeployments(namespace, '', onError);
    };
  });

  const onError = (err: APIErrorResponse) => {
    error =
      err?.body?.message || translate('deployments.error-message-fetching');
  };

  const columns = [
    { label: translate('deployments.status') },
    { label: translate('deployments.name') },
    { label: translate('deployments.build-id') },
    { label: translate('deployments.deployed') },
    { label: translate('deployments.actions') },
  ];
</script>

<div class="mb-4">
  <Input
    id="deployment-search"
    label="Filter deployments"
    labelHidden
    type="search"
    placeholder="Filter by Name"
    bind:value={search}
    icon="search"
  />
</div>

{#key [namespace]}
  <PaginatedTable
    let:visibleItems
    {onFetch}
    {onError}
    aria-label={translate('deployments.deployments')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('deployments.empty-state-title')}
    errorMessage={translate('deployments.error-message-fetching')}
  >
    <caption class="sr-only" slot="caption"
      >{translate('deployments.deployments')}</caption
    >
    <tr slot="headers" class="text-left">
      {#each columns as { label }}
        <th>{label}</th>
      {/each}
    </tr>
    {#each visibleItems.filter((d) => !search || d.name
          .toLowerCase()
          .includes(search.toLowerCase())) as deployment}
      <DeploymentTableRow {deployment} {columns} />
    {/each}

    <svelte:fragment slot="empty">
      <WorkersDeploymentsEmptyState />
      {#if error}
        <Alert intent="warning" icon="warning" class="px-12">
          {error}
        </Alert>
      {/if}
    </svelte:fragment>
  </PaginatedTable>
{/key}
