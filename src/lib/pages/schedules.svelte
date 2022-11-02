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
  import SimpleSplitButton from '$lib/holocene/simple-split-button.svelte';
  import { timeFormat } from '$lib/stores/time-format';
  import { capitalize } from '$lib/utilities/format-camel-case';

  $: namespaceName = $page.params.namespace;
  $: fetchSchedules = fetchAllSchedules(namespaceName);

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

<div class="flex flex-row justify-between">
  <div>
    <h1 class="flex items-center gap-2 text-2xl">
      Schedules<Badge type="beta">Beta</Badge>
      <NamespaceSelector />
    </h1>
    <p class="text-sm text-gray-600" data-cy="namespace-name">
      {namespaceName}
    </p>
  </div>
  <Button
    class="h-10"
    dataCy="create-schedule"
    on:click={() => goto(routeForScheduleCreate({ namespace: namespaceName }))}
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
            bind:value={search}
            on:submit={noop}
          />
        </div>
      </svelte:fragment>
      <svelte:fragment slot="action-top-right">
        <SimpleSplitButton
          class="bg-white"
          buttonClass="border border-gray-900"
          id="datetime"
          label={capitalize($timeFormat)}
          icon="clock"
        >
          <button
            on:click={() => ($timeFormat = 'relative')}
            class="timezone-label"
          >
            Relative
          </button>
          <button on:click={() => ($timeFormat = 'UTC')} class="timezone-label">
            UTC
          </button>
          <button
            on:click={() => ($timeFormat = 'local')}
            class="timezone-label"
          >
            Local
          </button>
        </SimpleSplitButton>
      </svelte:fragment>
      <SchedulesTable>
        {#each visibleItems as schedule}
          <SchedulesTableRow {schedule} />
        {/each}
      </SchedulesTable>
    </Pagination>
  {:else}
    <div class="my-12 flex flex-col items-center justify-start gap-2">
      <EmptyState title={'No Schedules Found'} content={errorMessage} {error} />
      <Button
        as="anchor"
        target="_external"
        href="https://docs.temporal.io/workflows/#how-to-enable-schedules"
        >Get Started With Docs</Button
      >
    </div>
  {/if}
{/await}

<style lang="postcss">
  .timezone-label {
    @apply flex cursor-pointer whitespace-nowrap px-4 py-3 font-secondary text-sm font-medium hover:bg-gray-50;
  }
</style>
