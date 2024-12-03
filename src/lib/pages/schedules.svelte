<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import SchedulesCount from '$lib/components/schedule/schedules-count.svelte';
  import SchedulesTableRow from '$lib/components/schedule/schedules-table-row.svelte';
  import SearchAttributeFilter from '$lib/components/search-attribute-filter/index.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedSchedules } from '$lib/services/schedule-service';
  import { isCloud } from '$lib/stores/advanced-visibility';
  import {
    availableScheduleColumns,
    configurableTableColumns,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';
  import { coreUserStore } from '$lib/stores/core-user';
  import { scheduleFilters } from '$lib/stores/filters';
  import { schedulesCount } from '$lib/stores/schedules';
  import {
    customSearchAttributes,
    searchAttributes,
  } from '$lib/stores/search-attributes';
  import { temporalVersion } from '$lib/stores/versions';
  import { SEARCH_ATTRIBUTE_TYPE } from '$lib/types/workflows';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import type { APIErrorResponse } from '$lib/utilities/request-from-api';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';
  import { minimumVersionRequired } from '$lib/utilities/version-check';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  const coreUser = coreUserStore();
  let customizationDrawerOpen = $state(false);
  let error = $state('');
  let refresh = $state(Date.now());

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  const namespace = $derived($page.params.namespace);
  const columns = $derived(
    $configurableTableColumns?.[namespace]?.schedules ?? [],
  );
  const createDisabled = $derived($coreUser.namespaceWriteDisabled(namespace));
  const searchAttributeOptions = $derived(
    Object.entries({
      ...(($isCloud || minimumVersionRequired('1.25.0', $temporalVersion)) && {
        ScheduleId: SEARCH_ATTRIBUTE_TYPE.KEYWORD,
      }),
      ...$customSearchAttributes,
    }).map(([key, value]) => {
      return {
        label: key,
        value: key,
        type: value,
      };
    }),
  );
  const query = $derived($page.url.searchParams.get('query'));
  const onFetch = $derived(() => {
    error = '';
    return fetchPaginatedSchedules(namespace, query, onError);
  });
  const availableColumns = $derived(availableScheduleColumns(namespace));

  const searchAttributesValue = $derived($searchAttributes);
  onMount(() => {
    if (query) {
      if ($isCloud || minimumVersionRequired('1.25.0', $temporalVersion)) {
        searchAttributesValue.ScheduleId = SEARCH_ATTRIBUTE_TYPE.KEYWORD;
      }
      $scheduleFilters = toListWorkflowFilters(query, searchAttributesValue);
    }
  });

  const onError = (err: APIErrorResponse) => {
    error = err?.body?.message || translate('schedules.error-message-fetching');
  };
</script>

{#key [namespace, query, refresh]}
  <PaginatedTable
    let:visibleItems
    {onFetch}
    {onError}
    total={$schedulesCount}
    aria-label={translate('common.schedules')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('schedules.empty-state-title')}
    errorMessage={translate('schedules.error-message-fetching')}
  >
    <caption class="sr-only" slot="caption"
      >{translate('common.schedules')}</caption
    >

    <div class="flex flex-col gap-4" slot="header" let:visibleItems>
      {@const showActions = visibleItems.length || query}
      <h1 class="flex flex-col gap-0 md:flex-row md:items-center md:gap-2">
        <SchedulesCount />
      </h1>
      <div class="flex flex-col justify-between gap-2 md:flex-row">
        {#if showActions}
          <SearchAttributeFilter
            bind:filters={$scheduleFilters}
            options={searchAttributeOptions}
            refresh={() => {
              refresh = Date.now();
            }}
          />
          <Button
            leadingIcon="settings"
            variant="secondary"
            on:click={openCustomizationDrawer}
          />
          {#if !createDisabled}
            <Button
              data-testid="create-schedule"
              href={routeForScheduleCreate({ namespace })}
              disabled={!writeActionsAreAllowed()}
            >
              {translate('schedules.create')}
            </Button>
          {/if}
        {/if}
      </div>
    </div>

    <tr slot="headers" class="text-left">
      {#each columns as { label }}
        <th>{label}</th>
      {/each}
    </tr>
    {#each visibleItems as schedule}
      <SchedulesTableRow {schedule} {columns} />
    {/each}

    <svelte:fragment slot="empty">
      {#if error}
        <EmptyState title={translate('schedules.empty-state-title')}>
          <Alert intent="warning" icon="warning" class="mx-12">
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
          {#if !createDisabled}
            <Button
              data-testid="create-schedule"
              on:click={() => goto(routeForScheduleCreate({ namespace }))}
              disabled={!writeActionsAreAllowed()}
            >
              {translate('schedules.create')}
            </Button>
          {/if}
        </EmptyState>
      {/if}
    </svelte:fragment>
  </PaginatedTable>
{/key}

<ConfigurableTableHeadersDrawer
  {availableColumns}
  bind:open={customizationDrawerOpen}
  table={TABLE_TYPE.SCHEDULES}
  type={translate('schedules.schedule')}
  title={translate('common.schedules')}
/>
