<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import SchedulesCount from '$lib/components/schedule/schedules-count.svelte';
  import SchedulesTableRow from '$lib/components/schedule/schedules-table-row.svelte';
  import SchedulesTable from '$lib/components/schedule/schedules-table.svelte';
  import SearchAttributeFilter from '$lib/components/search-attribute-filter/index.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedSchedules } from '$lib/services/schedule-service';
  import { coreUserStore } from '$lib/stores/core-user';
  import { scheduleFilters } from '$lib/stores/filters';
  import { schedulesCount } from '$lib/stores/schedules';
  import {
    customSearchAttributes,
    searchAttributes,
  } from '$lib/stores/search-attributes';
  import type { ScheduleListEntry } from '$lib/types';
  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import type { ErrorCallback } from '$lib/utilities/request-from-api';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  $: namespace = $page.params.namespace;

  let refresh = Date.now();
  let error = '';
  const onError: ErrorCallback = (err) =>
    (error =
      err?.body?.message ??
      `${translate('schedules.error-message-fetching')}: ${err.status}: ${
        err.statusText
      }`);

  let coreUser = coreUserStore();
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

  let search = '';
  $: filteredSchedules = (schedules: ScheduleListEntry[]) =>
    search
      ? schedules.filter((schedule) =>
          schedule.scheduleId.toLowerCase().includes(search.toLowerCase()),
        )
      : schedules;

  onMount(() => {
    if (query) {
      // Set filters from inital page load query if it exists
      $scheduleFilters = toListWorkflowFilters(query, $searchAttributes);
    }
  });
</script>

{#key [namespace, query, refresh]}
  <ApiPagination
    let:visibleItems
    {onFetch}
    {onError}
    total={$schedulesCount}
    aria-label={translate('common.schedules')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('schedules.empty-state-title')}
    fallbackErrorMessage={translate('schedules.error-message-fetching')}
  >
    <header
      class="flex flex-row justify-between gap-2"
      slot="header"
      let:visibleItems
    >
      <div>
        <h1 class="flex flex-col gap-0 md:flex-row md:items-center md:gap-2">
          <SchedulesCount />
        </h1>
      </div>
      {#if !createDisabled && (visibleItems.length || query)}
        <Button
          data-testid="create-schedule"
          href={routeForScheduleCreate({ namespace })}
          disabled={!writeActionsAreAllowed()}
        >
          {translate('schedules.create')}
        </Button>
      {/if}
    </header>
    <svelte:fragment slot="action-top-left" let:visibleItems>
      {#if visibleItems.length || query}
        <SearchAttributeFilter
          bind:filters={$scheduleFilters}
          options={searchAttributeOptions}
          refresh={() => {
            refresh = Date.now();
          }}
        />
      {/if}
    </svelte:fragment>
    <SchedulesTable>
      {#each filteredSchedules(visibleItems) as schedule}
        <SchedulesTableRow {schedule} />
      {/each}
    </SchedulesTable>
    <div slot="empty">
      {#if query}
        <SchedulesTable>
          <TableRow>
            <td class="hidden xl:table-cell" />
            <td class="hidden xl:table-cell" />
            <td colspan="3">
              <EmptyState
                title={translate('schedules.empty-state-title')}
                content={translate('schedules.empty-state-description')}
              />
            </td>
            <td class="hidden xl:table-cell" />
          </TableRow>
        </SchedulesTable>
      {:else}
        <EmptyState title={translate('schedules.empty-state-title')} {error}>
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
          {#if !error && !createDisabled}
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
    </div>
  </ApiPagination>
{/key}
