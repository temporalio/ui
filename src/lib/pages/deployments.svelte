<script lang="ts">
  import { page } from '$app/state';

  import DeploymentTableRow from '$lib/components/deployments/deployment-table-row.svelte';
  import DeploymentsEmptyState from '$lib/components/deployments/deployments-empty-state.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedDeployments } from '$lib/services/deployments-service';
  import { has } from '$lib/utilities/has';
  import { routeForWorkerDeploymentCreate } from '$lib/utilities/route-for';

  let error = $state('');

  const namespace = $derived(page.params.namespace);
  const createHref = $derived(routeForWorkerDeploymentCreate({ namespace }));

  const onFetch = $derived.by(() => {
    return () => {
      error = '';
      return fetchPaginatedDeployments(namespace, '', onError);
    };
  });

  const onError = (err: unknown) => {
    if (
      has(err, 'body') &&
      has(err.body, 'message') &&
      typeof err.body.message === 'string'
    ) {
      error = err.body.message;
    } else {
      error = translate('deployments.error-message-fetching');
    }
  };

  const columns = [
    { label: translate('deployments.deployment') },
    { label: translate('deployments.latest-version') },
    { label: translate('deployments.created') },
  ];
</script>

{#key [namespace]}
  <div class="flex flex-col gap-4">
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
        {#each columns as { label } (label)}
          <th>{label}</th>
        {/each}
      </tr>
      {#each visibleItems as deployment}
        <DeploymentTableRow {deployment} {columns} />
      {/each}

      <svelte:fragment slot="empty">
        <DeploymentsEmptyState {createHref} {error} />
      </svelte:fragment>
    </PaginatedTable>
  </div>
{/key}
