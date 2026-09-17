<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import CountRefreshButton from '$lib/components/count-refresh-button.svelte';
  import SavedQueryViews from '$lib/components/saved-query-views/saved-views.svelte';
  import SchedulesTableRow from '$lib/components/schedule/schedules-list/schedules-table-row.svelte';
  import FilterBar from '$lib/components/search-attribute-filter/filter-bar.svelte';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import MaximizableTableView from '$lib/holocene/table/paginated-table/maximizable-view.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalSettings, IconWarning } from '$lib/io/icon';
  import { createCountPoller } from '$lib/runes/count-poller.svelte';
  import { fetchPaginatedSchedules } from '$lib/services/schedule-service';
  import { fetchScheduleCount } from '$lib/services/workflow-counts';
  import {
    availableScheduleColumns,
    configurableTableColumns,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';
  import { coreUserStore } from '$lib/stores/core-user';
  import { scheduleFilters } from '$lib/stores/filters';
  import {
    DEFAULT_SCHEDULE_SYSTEM_VIEW,
    savedScheduleQueries,
    systemScheduleViews,
  } from '$lib/stores/saved-queries';
  import { schedulesCount, schedulesRefresh } from '$lib/stores/schedules';
  import {
    scheduleSearchAttributeOptions,
    scheduleSearchAttributes,
  } from '$lib/stores/search-attributes';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  const { namespace } = $derived(page.params);
  const query = $derived(page.url.searchParams.get('query') ?? '');

  const countPoller = createCountPoller({
    getStore: () => schedulesCount,
    fetch: () => fetchScheduleCount({ namespace, query }),
    transform: (countStr) => parseInt(countStr ?? '0', 10),
    watch: () => {
      void namespace;
      void query;
      void $schedulesRefresh;
    },
  });

  const refreshTime = $derived(new Date(countPoller.refreshTime));
  const refreshTimeFormatted = $derived($timestamp(refreshTime));

  const coreUser = coreUserStore();
  let customizationDrawerOpen = $state(false);
  let error = $state('');

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  const columns = $derived(
    $configurableTableColumns?.[namespace]?.schedules ?? [],
  );
  const createDisabled = $derived($coreUser.namespaceWriteDisabled(namespace));
  const onFetch = $derived(() => {
    error = '';
    return fetchPaginatedSchedules(namespace, query, onError);
  });
  const availableColumns = $derived(availableScheduleColumns(namespace));

  onMount(() => {
    if (query) {
      $scheduleFilters = toListWorkflowFilters(
        query,
        $scheduleSearchAttributes,
      );
    }
  });

  const onError = (err: unknown) => {
    error =
      (err as APIErrorResponse)?.body?.message ||
      translate('schedules.error-message-fetching');
  };
</script>

<header class="flex flex-col gap-2">
  <div class="flex flex-col items-start justify-between gap-2 md:flex-row">
    <div class="flex flex-row flex-wrap items-start gap-2">
      <div>
        <div class="flex flex-row flex-wrap items-start gap-2">
          <h1
            class="flex items-center gap-2 leading-7"
            data-cy="schedules-title"
          >
            <span
              role="status"
              aria-atomic="true"
              class="flex items-center gap-2"
            >
              <span data-testid="schedule-count"
                >{$schedulesCount.count.toLocaleString()}</span
              >
              {translate('common.schedules-plural', {
                count: $schedulesCount.count,
              })}
            </span>
          </h1>
          <CountRefreshButton
            count={$schedulesCount.newCount}
            refresh={schedulesRefresh}
          />
        </div>
        <p class="mt-2 text-xs text-secondary">
          {refreshTimeFormatted}
        </p>
      </div>
    </div>
    {#if !createDisabled}
      <div class="flex items-center gap-4">
        <Button
          data-testid="create-schedule"
          href={routeForScheduleCreate({ namespace })}
          disabled={!writeActionsAreAllowed()}
        >
          {translate('schedules.create')}
        </Button>
      </div>
    {/if}
  </div>
</header>

<MaximizableTableView>
  <SavedQueryViews
    filters={scheduleFilters}
    savedQueries={savedScheduleQueries}
    systemViews={systemScheduleViews}
    defaultView={DEFAULT_SCHEDULE_SYSTEM_VIEW}
    searchAttributes={scheduleSearchAttributes}
    id="schedule"
  />
  <FilterBar
    filters={scheduleFilters}
    options={$scheduleSearchAttributeOptions}
    searchAttributes={$scheduleSearchAttributes}
    id="schedules"
  />
  {#key [namespace, query, $schedulesRefresh]}
    <PaginatedTable
      {onFetch}
      {onError}
      total={$schedulesCount.count}
      aria-label={translate('common.schedules')}
      pageSizeSelectLabel={translate('common.per-page')}
      nextButtonLabel={translate('common.next')}
      previousButtonLabel={translate('common.previous')}
      emptyStateMessage={translate('schedules.empty-state-title')}
      errorMessage={translate('schedules.error-message-fetching')}
    >
      {#snippet caption()}
        <caption class="sr-only">{translate('common.schedules')}</caption>
      {/snippet}
      {#snippet headers()}
        <tr class="text-left">
          {#each columns as { label }, i (`${label}:${i}`)}
            <th>{label}</th>
          {/each}
        </tr>
      {/snippet}
      {#snippet rows({ visibleItems })}
        {#each visibleItems as schedule}
          <SchedulesTableRow {schedule} {columns} />
        {/each}
      {/snippet}

      {#snippet empty()}
        <div class="flex h-full flex-col items-center justify-center">
          {#if error}
            <EmptyState title={translate('schedules.empty-state-title')}>
              <Alert intent="warning" Icon={IconWarning} class="mx-12">
                {error}
              </Alert>
            </EmptyState>
          {:else if query}
            <EmptyState
              title={translate('schedules.empty-state-title')}
              content={translate('schedules.empty-state-description')}
            />
          {:else}
            <EmptyState title={translate('schedules.empty-state-title')}>
              <p>
                {translate('schedules.getting-started-docs-link-preface')}
                <Link newTab href="https://docs.temporal.io/workflows/#schedule"
                  >{translate('schedules.getting-started-docs-link')}</Link
                >
                {translate('schedules.getting-started-cli-link-preface')}
                <Link newTab href="https://docs.temporal.io/cli/schedule"
                  >Temporal CLI</Link
                >.
              </p>
            </EmptyState>
          {/if}
        </div>
      {/snippet}
      {#snippet actionsEndAdditional()}
        <Tooltip text={translate('common.configure-columns')} top>
          <Button
            onclick={openCustomizationDrawer}
            data-testid="schedules-summary-table-configuration-button"
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
</MaximizableTableView>

<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  table={TABLE_TYPE.SCHEDULES}
  type={translate('common.columns')}
  title={translate('common.schedules-table')}
/>
