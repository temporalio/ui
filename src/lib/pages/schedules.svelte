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
  import PageTitle from '$lib/holocene/page-title.svelte';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import SchedulesTable from '$lib/components/schedule/schedules-table.svelte';
  import SchedulesTableRow from '$lib/components/schedule/schedules-table-row.svelte';

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

<PageTitle title={`Schedules | ${namespaceName}`} url={$page.url.href} />
<div class="flex flex-row justify-between">
  <div>
    <h1 class="flex items-center gap-2 text-2xl">
      Schedules<Badge type="alpha">Alpha</Badge>
      <NamespaceSelector />
    </h1>
    <p class="text-sm text-gray-600" data-cy="namespace-name">
      {namespaceName}
    </p>
  </div>
  <Button
    class="h-10"
    on:click={() => goto(routeForScheduleCreate({ namespace: namespaceName }))}
    >Create Schedule</Button
  >
</div>
<div class="w-full xl:w-1/2">
  <Input
    icon="search"
    id="schedule-name-filter"
    placeholder="Schedule Name"
    bind:value={search}
    on:submit={noop}
  />
</div>

{#await fetchSchedules}
  <Loading />
{:then { schedules, error }}
  {#if schedules?.length}
    <Pagination items={filteredSchedules(schedules)} let:visibleItems>
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
