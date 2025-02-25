<script lang="ts">
  import { page } from '$app/stores';

  import DeploymentTableRow from '$lib/components/deployments/deployment-table-row.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedDeployments } from '$lib/services/deployments-service';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';

  let error = '';

  $: namespace = $page.params.namespace;

  $: onFetch = () => {
    error = '';
    return fetchPaginatedDeployments(namespace, '', onError);
  };

  const onError = (err: APIErrorResponse) => {
    error =
      err?.body?.message || translate('deployments.error-message-fetching');
  };

  const columns = [
    { label: translate('deployments.name'), pinned: true },
    {
      label: translate('deployments.deployment-version'),
      pinned: true,
    },
    { label: translate('deployments.deployed'), pinned: true },
    {
      label: translate('deployments.workflows'),
      pinned: true,
    },
  ];
</script>

<div class="flex flex-col gap-4 pt-4">
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
      <div class="flex flex-col gap-4" slot="header">
        <div class="flex flex-wrap items-center gap-2">
          <h1>
            {translate('deployments.worker-deployments')}
          </h1>
          <Badge class="shrink-0">Pre-Release</Badge>
        </div>
        <p class="text-sm text-secondary">
          {translate('deployments.worker-deployments-description')}
        </p>
      </div>

      <tr slot="headers" class="text-left">
        {#each columns as { label }, index}
          <th class={index === 0 && 'w-full'}>{label}</th>
        {/each}
      </tr>
      {#each visibleItems as deployment}
        <DeploymentTableRow {deployment} {columns} />
      {/each}

      <svelte:fragment slot="empty">
        {#if error}
          <EmptyState
            title={translate('deployments.empty-state-title')}
            content={translate('deployments.empty-state-description')}
          >
            <Alert intent="warning" icon="warning" class="mx-12">
              {error}
            </Alert>
          </EmptyState>
        {:else}
          <EmptyState
            title={translate('deployments.empty-state-title')}
            content={translate('deployments.empty-state-description')}
          />
        {/if}
      </svelte:fragment>
    </PaginatedTable>
  {/key}
</div>
