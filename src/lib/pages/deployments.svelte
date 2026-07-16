<script lang="ts">
  import { page } from '$app/state';

  import DeploymentTableRow from '$lib/components/deployments/deployment-table-row.svelte';
  import DeploymentsEmptyState from '$lib/components/deployments/deployments-empty-state.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedDeployments } from '$lib/services/deployments-service';
  import {
    availableDeploymentColumns,
    configurableTableColumns,
    DEFAULT_DEPLOYMENTS_COLUMNS,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';
  import { refresh } from '$lib/stores/workers';
  import { has } from '$lib/utilities/has';
  import { routeForWorkerDeploymentCreate } from '$lib/utilities/route-for';

  interface Props {
    canCreateServerlessDeployment?: boolean;
  }

  let { canCreateServerlessDeployment = true }: Props = $props();

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
      return;
    }
    error = translate('deployments.error-message-fetching');
  };

  const columns = $derived(
    $configurableTableColumns?.[namespace]?.deployments ??
      DEFAULT_DEPLOYMENTS_COLUMNS,
  );
  const availableColumns = $derived(availableDeploymentColumns(namespace));

  let customizationDrawerOpen = $state(false);
  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  const columnLabel = (label: string): string => {
    switch (label) {
      case 'Deployment':
        return translate('deployments.deployment');
      case 'Current Version':
        return translate('deployments.current-version');
      case 'Latest Version':
        return translate('deployments.latest-version');
      case 'Created At':
        return translate('deployments.created');
      default:
        return label;
    }
  };
</script>

{#key [namespace, $refresh]}
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
          <th>{columnLabel(label)}</th>
        {/each}
        <th>{translate('deployments.actions')}</th>
      </tr>
      {#each visibleItems as deployment}
        <DeploymentTableRow
          {deployment}
          {columns}
          onChange={() => refresh.update((n) => n + 1)}
        />
      {/each}

      <svelte:fragment slot="empty">
        <DeploymentsEmptyState
          {createHref}
          {error}
          {canCreateServerlessDeployment}
        />
      </svelte:fragment>
      <svelte:fragment slot="actions-end-additional">
        <Tooltip text="Configure Columns" top>
          <Button
            on:click={openCustomizationDrawer}
            data-testid="deployments-table-configuration-button"
            size="xs"
            variant="ghost"
          >
            <Icon name="settings" />
          </Button>
        </Tooltip>
      </svelte:fragment>
    </PaginatedTable>
  </div>
{/key}

<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  table={TABLE_TYPE.DEPLOYMENTS}
  type={translate('common.columns')}
  title={translate('deployments.deployments')}
/>
