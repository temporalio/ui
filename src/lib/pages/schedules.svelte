<script lang="ts">
  import { noop } from 'svelte/internal';

  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import SchedulesCount from '$lib/components/schedule/schedules-count.svelte';
  import SchedulesTableRow from '$lib/components/schedule/schedules-table-row.svelte';
  import SearchAttributeFilter from '$lib/components/search-attribute-filter/index.svelte';
  import ConfigurableTableHeadersDrawer from '$lib/components/workflow/configurable-table-headers-drawer/index.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedSchedules } from '$lib/services/schedule-service';
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
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  let refresh = Date.now();
  let coreUser = coreUserStore();
  let customizationDrawerOpen = false;
  let search = '';

  const openCustomizationDrawer = () => {
    customizationDrawerOpen = true;
  };

  $: namespace = $page.params.namespace;
  $: columns = $configurableTableColumns?.[namespace]?.schedules ?? [];
  $: createDisabled = $coreUser.namespaceWriteDisabled(namespace);
  $: searchAttributeOptions = Object.entries($customSearchAttributes).map(
    ([key, value]) => {
      return {
        label: key,
        value: key,
        type: value,
      };
    },
  );
  $: query = $page.url.searchParams.get('query');
  $: onFetch = () => fetchPaginatedSchedules(namespace, query);
  $: availableColumns = availableScheduleColumns(namespace);

  onMount(() => {
    if (query) {
      // Set filters from inital page load query if it exists
      $scheduleFilters = toListWorkflowFilters(query, $searchAttributes);
    }
  });
</script>

{#key [namespace, query, refresh]}
  <PaginatedTable
    let:visibleItems
    {onFetch}
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
      {#if showActions}
        <div class="w-96">
          <Input
            icon="search"
            type="search"
            label={translate('schedules.name')}
            labelHidden
            id="schedule-name-filter"
            placeholder={translate('schedules.name')}
            clearable
            clearButtonLabel={translate('common.clear-input-button-label')}
            bind:value={search}
            on:submit={noop}
          />
        </div>
      {/if}
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
    {@const filteredItems = search
      ? visibleItems.filter((schedule) =>
          schedule.scheduleId.toLowerCase().includes(search.toLowerCase()),
        )
      : visibleItems}
    {#each filteredItems as schedule}
      <SchedulesTableRow {schedule} {columns} />
    {:else}
      {#if visibleItems.length}
        <tr>
          <td colspan={columns.length}>
            <EmptyState
              title={translate('schedules.empty-state-title')}
              content={translate('schedules.empty-state-description')}
            />
          </td>
        </tr>
      {/if}
    {/each}

    <svelte:fragment slot="empty">
      {#if query}
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
