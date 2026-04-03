<script lang="ts">
  import { page } from '$app/state';

  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import DeploymentTableRow from '$lib/components/deployments/deployment-table-row.svelte';
  import DeploymentsEmptyState from '$lib/components/deployments/deployments-empty-state.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedDeployments } from '$lib/services/deployments-service';
  import { has } from '$lib/utilities/has';
  import { routeForServerlessWorkerCreate } from '$lib/utilities/route-for';

  let error = $state('');
  let filter = $state('');

  const namespace = $derived(page.params.namespace);
  const createHref = $derived(routeForServerlessWorkerCreate({ namespace }));

  const onFetch = $derived.by(() => {
    return () => {
      error = '';
      return fetchPaginatedDeployments(namespace, filter, onError);
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
    { label: translate('deployments.name') },
    { label: translate('deployments.latest-version') },
    { label: translate('deployments.created') },
  ];
</script>

{#key [namespace]}
  <div class="flex flex-col gap-4">
    <CapabilityGuard capability="serverlessDeployments">
      <div class="flex items-center gap-2">
        <Input
          id="deployment-filter"
          bind:value={filter}
          icon="search"
          label={translate('deployments.filter-deployments')}
          labelHidden
          type="search"
          placeholder={translate(
            'deployments.worker-deployments-search-placeholder',
          )}
          class="flex-1"
        />
        <Button variant="primary" href={createHref}>
          {translate('workers.create-serverless-worker')}
        </Button>
      </div>
    </CapabilityGuard>
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
