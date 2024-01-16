<script lang="ts">
  import { noop } from 'svelte/internal';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import SchedulesTableRow from '$lib/components/schedule/schedules-table-row.svelte';
  import SchedulesTable from '$lib/components/schedule/schedules-table.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedSchedules } from '$lib/services/schedule-service';
  import { coreUserStore } from '$lib/stores/core-user';
  import type { ScheduleListEntry } from '$lib/types';
  import type { ErrorCallback } from '$lib/utilities/request-from-api';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';
  import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

  $: namespace = $page.params.namespace;

  let error = '';
  const onError: ErrorCallback = (err) =>
    (error =
      err?.body?.message ??
      `${translate('schedules.error-message-fetching')}: ${err.status}: ${
        err.statusText
      }`);

  let coreUser = coreUserStore();
  $: createDisabled = $coreUser.namespaceWriteDisabled(namespace);

  $: onFetch = () => fetchPaginatedSchedules(namespace);

  let search = '';
  $: filteredSchedules = (schedules: ScheduleListEntry[]) =>
    search
      ? schedules.filter((schedule) =>
          schedule.scheduleId.toLowerCase().includes(search.toLowerCase()),
        )
      : schedules;
</script>

{#key namespace}
  <ApiPagination
    let:visibleItems
    {onFetch}
    {onError}
    aria-label={translate('common.schedules')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('schedules.empty-state-title')}
    fallbackErrorMessage={translate('schedules.error-message-fetching')}
  >
    <header class="flex flex-row justify-between gap-2" slot="header">
      <div>
        <h1
          class="flex flex-col gap-0 text-lg md:flex-row md:items-center md:gap-2 md:text-2xl"
        >
          {translate('common.schedules')}
        </h1>
      </div>
      {#if !createDisabled && visibleItems.length}
        <Button
          data-testid="create-schedule"
          on:click={() => goto(routeForScheduleCreate({ namespace }))}
          disabled={!writeActionsAreAllowed()}
        >
          {translate('schedules.create')}
        </Button>
      {/if}
    </header>
    <svelte:fragment slot="action-top-left">
      {#if visibleItems.length}
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
    </svelte:fragment>
    <SchedulesTable>
      {#each filteredSchedules(visibleItems) as schedule}
        <SchedulesTableRow {schedule} />
      {:else}
        <TableRow>
          <td class="hidden xl:table-cell" />
          <td colspan="3">
            <EmptyState
              title={translate('schedules.empty-state-title')}
              content={translate('schedules.empty-state-description')}
            />
          </td>
          <td class="hidden xl:table-cell" />
        </TableRow>
      {/each}
    </SchedulesTable>
    <div
      class="my-12 flex flex-col items-center justify-start gap-2"
      slot="empty"
    >
      <EmptyState title={translate('schedules.empty-state-title')} {error}>
        <p>
          {translate('schedules.getting-started-docs-link-preface')}
          <Link
            target="_external"
            href="https://docs.temporal.io/workflows/#schedule"
            >{translate('schedules.getting-started-docs-link')}</Link
          >
          {translate('schedules.getting-started-cli-link-preface')}
          <Link target="_external" href="https://docs.temporal.io/cli/schedule"
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
    </div>
  </ApiPagination>
{/key}
