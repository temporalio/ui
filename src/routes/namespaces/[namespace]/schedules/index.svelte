<script lang="ts">
  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Button from '$holocene/button.svelte';
  import Badge from '$holocene/badge.svelte';
  import Loading from '$holocene/loading.svelte';
  import Table from '$lib/components/table/index.svelte';
  import ScheduleRow from '$lib/components/schedule/schedule-row.svelte';

  import { columns } from './_schedule-table-columns';
  import { noop } from 'svelte/internal';
  import Input from '$lib/holocene/input/input.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import { fetchAllSchedules } from '$lib/services/schedule-service';
  import type { ScheduleListEntry } from '$types';
  import PageTitle from '$lib/holocene/page-title.svelte';

  let { namespace } = $page.params;

  let search = '';

  $: fetchSchedules = fetchAllSchedules(namespace);

  $: filteredSchedules = (schedules: ScheduleListEntry[]) =>
    search
      ? schedules.filter((schedule) =>
          schedule.scheduleId.toLowerCase().includes(search.toLowerCase()),
        )
      : schedules;

  const errorMessage =
    'Create scheduled actions using our Public API or TCTL (CLI).';
</script>

<PageTitle title={`Schedules | ${namespace}`} url={$page.url.href} />
<div class="flex flex-row justify-between">
  <h2 class="flex items-center gap-2 text-2xl">
    Schedules<Badge type="alpha">Alpha</Badge>
  </h2>
  <Button
    class="h-10"
    on:click={() => goto(routeForScheduleCreate({ namespace }))}
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
      <Table {columns}>
        {#each visibleItems as schedule}
          <ScheduleRow {schedule} />
        {/each}
      </Table>
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
