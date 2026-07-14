<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { page } from '$app/state';

  import CountRefreshButton from '$lib/components/count-refresh-button.svelte';
  import SavedQueryViews from '$lib/components/saved-query-views/saved-views.svelte';
  import NexusOperationsSummaryConfigurableTable from '$lib/components/standalone-nexus-operations/nexus-operations-summary-configurable-table.svelte';
  import FilterBar from '$lib/components/standalone-nexus-operations/nexus-operations-summary-filter-bar/filter-bar.svelte';
  import StatusCounts from '$lib/components/status-counts.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import Translate from '$lib/i18n/translate.svelte';
  import { fetchNexusOperationCountByStatus } from '$lib/services/nexus-operation-counts';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import {
    availableNexusOperationColumns,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';
  import { nexusOperationFilters } from '$lib/stores/filters';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { savedQueryNavOpen } from '$lib/stores/nav-open';
  import {
    nexusOperationCount,
    nexusOperationRefresh,
    nexusOperationsQuery,
    nexusOperationsSearchParams,
  } from '$lib/stores/nexus-operations';
  import {
    DEFAULT_NEXUS_SYSTEM_VIEW,
    savedNexusQueries,
    systemNexusViews,
  } from '$lib/stores/saved-queries';
  import { nexusOperationSearchAttributes } from '$lib/stores/search-attributes';
  import { getNexusOperationStatusAndCountOfGroup } from '$lib/utilities/get-nexus-operation-status-and-count';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  interface Props {
    headerActions?: Snippet;
    releaseStageBadge?: Snippet;
  }

  let { headerActions, releaseStageBadge }: Props = $props();

  const query = $derived(page.url.searchParams.get('query') ?? '');
  const namespace = $derived(page.params.namespace);
  const searchParams = $derived(page.url.searchParams.toString());

  let refreshTime = $state(new Date());

  const refreshTimeFormatted = $derived($timestamp(refreshTime));
  const availableColumns = $derived(availableNexusOperationColumns(namespace));

  onMount(() => {
    $lastUsedNamespace = page.params.namespace;
    if (query) {
      $nexusOperationFilters = toListWorkflowFilters(
        query,
        $nexusOperationSearchAttributes,
      );
    }
  });

  $effect(() => {
    $nexusOperationsQuery = query;
  });

  $effect(() => {
    $nexusOperationsSearchParams = searchParams;
  });

  let customizationDrawerOpen = $state(false);

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };
</script>

<header class="flex flex-col gap-2">
  <div class="flex flex-col justify-between gap-2 md:flex-row">
    <div class="flex flex-row flex-wrap items-start gap-2">
      <div>
        <h1 class="flex items-center gap-2 leading-7">
          {#if $supportsAdvancedVisibility}
            <span data-testid="nexus-operation-count"
              >{$nexusOperationCount.count.toLocaleString()}</span
            >
            <Translate
              key="standalone-nexus-operations.nexus-operations-plural"
              count={$nexusOperationCount.count}
            />
          {:else}
            <Translate
              key="standalone-nexus-operations.recent-nexus-operations"
            />
          {/if}
        </h1>
        <p class="mt-2 text-xs text-secondary">
          {refreshTimeFormatted}
        </p>
      </div>
      {@render releaseStageBadge?.()}
      <CountRefreshButton
        count={$nexusOperationCount.newCount}
        refresh={nexusOperationRefresh}
      />
      <StatusCounts
        bind:refreshTime
        countStore={nexusOperationCount}
        refresh={nexusOperationRefresh}
        filters={nexusOperationFilters}
        fetchCounts={fetchNexusOperationCountByStatus}
        getStatusAndCount={getNexusOperationStatusAndCountOfGroup}
        data-testid="nexus-operation-status"
      />
    </div>
    {#if headerActions}
      <div class="flex items-center gap-4">
        {@render headerActions()}
      </div>
    {/if}
  </div>
</header>

<FilterBar />
<div class="flex overflow-auto">
  <SavedQueryViews
    filters={nexusOperationFilters}
    savedQueries={savedNexusQueries}
    systemViews={systemNexusViews}
    defaultView={DEFAULT_NEXUS_SYSTEM_VIEW}
    searchAttributes={nexusOperationSearchAttributes}
    id="nexus"
  />
  <div
    class={merge(
      'flex w-[calc(100%-var(--panel-collapsed-w))] shrink flex-col transition-all lg:w-[calc(100%-var(--panel-expanded-w))]',
      !$savedQueryNavOpen && 'lg:w-[calc(100%-var(--panel-collapsed-w))]',
    )}
  >
    <NexusOperationsSummaryConfigurableTable
      onClickConfigure={openCustomizationDrawer}
    />
  </div>
</div>
<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  table={TABLE_TYPE.NEXUS_OPERATIONS}
  type={translate('common.columns')}
  title={translate('standalone-nexus-operations.nexus-operations-table')}
/>
