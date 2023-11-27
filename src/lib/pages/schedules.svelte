<script lang="ts">
  import { noop } from 'svelte/internal';

  import { page } from '$app/stores';

  import SchedulesTableRow from '$lib/components/schedule/schedules-table-row.svelte';
  import SchedulesTable from '$lib/components/schedule/schedules-table.svelte';
  import Button from '$lib/holocene/button.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchAllSchedules } from '$lib/services/schedule-service';
  import { coreUserStore } from '$lib/stores/core-user';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';

  import type { ScheduleListEntry } from '$types';

  $: namespace = $page.params.namespace;

  let hasSchedules = false;

  $: fetchSchedules = fetchAllSchedules(namespace).then((res) => {
    const { schedules } = res;
    hasSchedules = Boolean(schedules?.length);
    return res;
  });

  let coreUser = coreUserStore();
  $: createDisabled = $coreUser.namespaceWriteDisabled(namespace);

  let search = '';
  $: filteredSchedules = (schedules: ScheduleListEntry[]) =>
    search
      ? schedules.filter((schedule) =>
          schedule.scheduleId.toLowerCase().includes(search.toLowerCase()),
        )
      : schedules;
</script>

<header class="flex flex-row justify-between gap-2">
  <div>
    <h1
      class="flex flex-col gap-0 text-lg md:flex-row md:items-center md:gap-2 md:text-2xl"
    >
      {translate('common.schedules')}
    </h1>
    <p class="text-sm text-gray-600" data-testid="namespace-name">
      {namespace}
    </p>
  </div>
  {#if hasSchedules && !createDisabled}
    <Button
      data-testid="create-schedule"
      href={routeForScheduleCreate({ namespace })}
    >
      {translate('schedules.create')}
    </Button>
  {/if}
</header>

{#await fetchSchedules}
  <Loading />
{:then { schedules, error }}
  {#if schedules?.length}
    <Pagination
      items={filteredSchedules(schedules)}
      let:visibleItems
      aria-label={translate('common.schedules')}
      pageSizeSelectLabel={translate('common.per-page')}
      previousButtonLabel={translate('common.previous')}
      nextButtonLabel={translate('common.next')}
    >
      <svelte:fragment slot="action-top-left">
        <div class="w-full xl:w-1/2">
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
      </svelte:fragment>
      <SchedulesTable>
        {#each visibleItems as schedule}
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
    </Pagination>
  {:else}
    <div class="my-12 flex flex-col items-center justify-start gap-2">
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
            href={routeForScheduleCreate({ namespace })}
          >
            {translate('schedules.create')}
          </Button>
        {/if}
      </EmptyState>
    </div>
  {/if}
{/await}
