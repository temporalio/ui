<script lang="ts">
  import { page } from '$app/state';

  import DeploymentTableRow from '$lib/components/deployments/deployment-table-row.svelte';
  import DeploymentsEmptyState from '$lib/components/deployments/deployments-empty-state.svelte';
  import EmptyStateTransition from '$lib/components/empty-states/empty-state-transition.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/table/configurable-table-headers-drawer.svelte';
  import ResetColumnWidthsButton from '$lib/components/table/reset-column-widths-button.svelte';
  import Button from '$lib/holocene/button.svelte';
  import ColumnResizeHandle from '$lib/holocene/table/column-resize-handle.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import SortableTableHeader from '$lib/holocene/table/sortable-table-header.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalSettings } from '$lib/io/icon';
  import { createTableSort } from '$lib/runes/table-sort-state.svelte';
  import { fetchPaginatedDeployments } from '$lib/services/deployments-service';
  import {
    availableDeploymentColumns,
    configurableTableColumns,
    DEFAULT_DEPLOYMENTS_COLUMNS,
    MIN_COLUMN_WIDTH,
    resizeColumn,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';
  import { refresh } from '$lib/stores/workers';
  import type { ListWorkerDeployment } from '$lib/types/deployments';
  import { columnWidthStyle } from '$lib/utilities/column-width';
  import {
    type ComputeProviderConfig,
    configuredRegions,
  } from '$lib/utilities/compute-provider-config';
  import { has } from '$lib/utilities/has';
  import { routeForWorkerDeploymentCreate } from '$lib/utilities/route-for';
  import type { TableSortColumn } from '$lib/utilities/table-sort';

  interface Props {
    canCreateServerlessDeployment?: boolean;
    showConnectionStatus?: boolean;
    /**
     * The providers this Namespace may use and the regions it lives in. With
     * two or more regions, each Version shows the regions it covers.
     */
    providerConfig?: ComputeProviderConfig;
  }

  let {
    canCreateServerlessDeployment = true,
    showConnectionStatus = true,
    providerConfig,
  }: Props = $props();

  const namespaceRegions = $derived(configuredRegions(providerConfig));

  let error = $state('');

  const namespace = $derived(page.params.namespace);
  const tableSort = createTableSort(() => namespace);

  const createHref = $derived(routeForWorkerDeploymentCreate({ namespace }));

  let firstPageEmpty = $state(false);
  const showEmptyState = $derived(firstPageEmpty && !error);

  const onFetch = $derived.by(() => {
    return async () => {
      error = '';
      const fetchPage = await fetchPaginatedDeployments(namespace, '', onError);
      return (size: number, token: string) =>
        fetchPage(size, token).then((result) => {
          if (!token) firstPageEmpty = result.items.length === 0;
          return result;
        });
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

  const sortableColumns: Record<
    string,
    TableSortColumn<ListWorkerDeployment>
  > = {
    Deployment: { getValue: (deployment) => deployment.name, type: 'string' },
    'Current Version': {
      getValue: (deployment) =>
        deployment.currentVersionSummary?.deploymentVersion?.buildId,
      type: 'string',
    },
    'Latest Version': {
      getValue: (deployment) =>
        deployment.latestVersionSummary?.deploymentVersion?.buildId,
      type: 'string',
    },
    'Created At': {
      getValue: (deployment) => deployment.createTime,
      type: 'datetime',
    },
  };
  const sortColumns = $derived(
    Object.fromEntries(
      columns.map(({ label }) => [columnLabel(label), sortableColumns[label]]),
    ),
  );

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

<EmptyStateTransition empty={showEmptyState}>
  {#snippet emptyState()}
    <DeploymentsEmptyState {createHref} {canCreateServerlessDeployment} />
  {/snippet}
  {#key [namespace, $refresh]}
    <PaginatedTable
      bind:sort={tableSort.value}
      {sortColumns}
      {onFetch}
      {onError}
      aria-label={translate('deployments.deployments')}
      pageSizeSelectLabel={translate('common.per-page')}
      nextButtonLabel={translate('common.next')}
      previousButtonLabel={translate('common.previous')}
      emptyStateMessage={translate('deployments.empty-state-title')}
      errorMessage={translate('deployments.error-message-fetching')}
    >
      {#snippet caption()}
        <caption class="sr-only">{translate('deployments.deployments')}</caption
        >
      {/snippet}
      {#snippet headers()}
        <tr class="text-left">
          {#each columns as { label, width } (label)}
            <SortableTableHeader
              column={columnLabel(label)}
              style={columnWidthStyle(width)}
            >
              <ColumnResizeHandle
                label={columnLabel(label)}
                {width}
                min={MIN_COLUMN_WIDTH}
                onResize={(newWidth) =>
                  resizeColumn(
                    label,
                    newWidth,
                    namespace,
                    TABLE_TYPE.DEPLOYMENTS,
                  )}
              />
            </SortableTableHeader>
          {/each}
          <th>{translate('deployments.actions')}</th>
        </tr>
      {/snippet}
      {#snippet rows({ visibleItems })}
        {#each visibleItems as deployment (deployment.name)}
          <DeploymentTableRow
            {deployment}
            {columns}
            {showConnectionStatus}
            {namespaceRegions}
            onChange={() => refresh.update((n) => n + 1)}
          />
        {/each}
      {/snippet}

      {#snippet empty()}
        {#if error}
          <DeploymentsEmptyState
            {createHref}
            {error}
            {canCreateServerlessDeployment}
          />
        {/if}
      {/snippet}
      {#snippet actionsEndAdditional()}
        <ResetColumnWidthsButton
          {columns}
          {namespace}
          table={TABLE_TYPE.DEPLOYMENTS}
        />
        <Tooltip text={translate('common.configure-columns')} top>
          <Button
            onclick={openCustomizationDrawer}
            data-testid="deployments-table-configuration-button"
            size="xs"
            variant="ghost"
            aria-label={translate('common.configure-columns')}
            data-track-name="configure-columns-table-control"
            data-track-intent="action"
            data-track-text={translate('common.configure-columns')}
          >
            <IconTemporalSettings />
          </Button>
        </Tooltip>
      {/snippet}
    </PaginatedTable>
  {/key}
</EmptyStateTransition>

<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  table={TABLE_TYPE.DEPLOYMENTS}
  title={translate('deployments.deployments')}
/>
