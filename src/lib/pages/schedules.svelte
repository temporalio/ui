<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Pagination from '$holocene/pagination.svelte';
  import Button from '$holocene/button.svelte';
  import Badge from '$holocene/badge.svelte';
  import Loading from '$holocene/loading.svelte';

  import { noop } from 'svelte/internal';
  import Input from '$lib/holocene/input/input.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';
  import { fetchAllSchedules } from '$lib/services/schedule-service';
  import type { ScheduleListEntry } from '$types';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import SchedulesTable from '$lib/components/schedule/schedules-table.svelte';
  import SchedulesTableRow from '$lib/components/schedule/schedules-table-row.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import DropdownButton from '$lib/holocene/dropdown-button/dropdown-button.svelte';
  import { coreUserStore } from '$lib/stores/core-user';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';

  $: namespace = $page.params.namespace;

  $: fetchSchedules = fetchAllSchedules(namespace);

  let coreUser = coreUserStore();
  $: createDisabled = $coreUser.namespaceWriteDisabled(namespace);

  let search = '';
  $: filteredSchedules = (schedules: ScheduleListEntry[]) =>
    search
      ? schedules.filter((schedule) =>
          schedule.scheduleId.toLowerCase().includes(search.toLowerCase()),
        )
      : schedules;

  const errorMessage =
    'Create scheduled actions using our Public API or TCTL (CLI).';
</script>

<div class="flex flex-col justify-between gap-2 md:flex-row">
  <div>
    <h1 class="flex items-center gap-2 text-2xl">
      Schedules<Badge type="beta">Beta</Badge>
      <NamespaceSelector />
    </h1>
    <p class="text-sm text-gray-600" data-cy="namespace-name">
      {namespace}
    </p>
  </div>
  <Button
    class="h-10"
    dataCy="create-schedule"
    disabled={createDisabled}
    on:click={() => goto(routeForScheduleCreate({ namespace }))}
    >Create Schedule</Button
  >
</div>

{#await fetchSchedules}
  <Loading />
{:then { schedules, error }}
  {#if schedules?.length}
    <Pagination items={filteredSchedules(schedules)} let:visibleItems>
      <svelte:fragment slot="action-top-left">
        <div class="w-full xl:w-1/2">
          <Input
            icon="search"
            id="schedule-name-filter"
            placeholder="Schedule Name"
            clearable
            bind:value={search}
            on:submit={noop}
          />
        </div>
      </svelte:fragment>
      <svelte:fragment slot="action-top-right">
        <DropdownButton
          id="timezone"
          label={capitalize($timeFormat)}
          icon="clock"
        >
          <MenuItem on:click={() => ($timeFormat = 'relative')}
            >Relative</MenuItem
          >
          <MenuItem on:click={() => ($timeFormat = 'UTC')}>UTC</MenuItem>
          <MenuItem on:click={() => ($timeFormat = 'local')}>Local</MenuItem>
        </DropdownButton>
      </svelte:fragment>
      <SchedulesTable>
        {#each visibleItems as schedule}
          <SchedulesTableRow {schedule} />
        {:else}
          <TableRow>
            <td class="hidden xl:table-cell" />
            <td colspan="3">
              <EmptyState
                title="No Schedules Found"
                content={'Try a different search'}
              />
            </td>
            <td class="hidden xl:table-cell" />
          </TableRow>
        {/each}
      </SchedulesTable>
    </Pagination>
  {:else}
    <div class="my-12 flex flex-col items-center justify-start gap-2">
      <EmptyState title={'No Schedules Found'} content={errorMessage} {error} />
      <Button
        as="anchor"
        target="_external"
        href="https://docs.temporal.io/workflows/#schedule"
        >Get Started With Docs</Button
      >
    </div>
  {/if}
{/await}
