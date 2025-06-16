<script lang="ts">
  import { page } from '$app/state';

  import DeploymentTableRow from '$lib/components/deployments/deployment-table-row.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedDeployments } from '$lib/services/deployments-service';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';

  let error = $state('');

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
    { label: translate('deployments.name') },
    {
      label: translate('deployments.build-id'),
    },
    { label: translate('deployments.deployed') },
    {
      label: translate('deployments.actions'),
    },
  ];
</script>

<div class="flex flex-col gap-4">
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
      </div>
      <tr slot="headers" class="text-left">
        {#each columns as { label }}
          <th>{label}</th>
        {/each}
      </tr>
      {#each visibleItems as deployment}
        <DeploymentTableRow {deployment} {columns} />
      {/each}

      <svelte:fragment slot="empty">
        <EmptyState
          title={translate('deployments.empty-state-title')}
          class="px-4"
        >
          <p class="text-center">
            Enable Worker Deployments to manage your workers more effectively. <Link
              href="https://docs.temporal.io/worker-deployments"
              newTab>Learn more</Link
            >.
          </p>
          {#if error}
            <Alert intent="warning" icon="warning" class="px-12">
              {error}
            </Alert>
          {/if}
        </EmptyState>
      </svelte:fragment>
    </PaginatedTable>
  {/key}
</div>
