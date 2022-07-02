<script lang="ts">
  import {
    loading,
    updating,
    schedules,
    scheduleError,
  } from '$lib/stores/schedules';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Button from '$holocene/button.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Loading from '$lib/components/loading.svelte';
  import Table from '$lib/components/table/index.svelte';
  import ScheduleRow from '$lib/components/schedule/schedule-row.svelte';

  import { columns } from './_schedule-table-columns';
  import { noop } from 'svelte/internal';
  import Input from '$lib/holocene/input.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { routeForScheduleCreate } from '$lib/utilities/route-for';

  let { namespace } = $page.params;

  let search = '';

  $: filteredSchedules = (schedules) =>
    search
      ? schedules.filter((schedule) => schedule.scheduleId.includes(search))
      : schedules;

  const errorMessage =
    'Create scheduled actions using our Public API or TCTL (CLI).';
</script>

<div class="flex flex-row justify-between">
  <h2 class="text-2xl">Schedules <Badge type="alpha">Alpha</Badge></h2>
  <Button
    class="h-10"
    primary
    on:click={() => goto(routeForScheduleCreate({ namespace }))}
    >Create Schedule</Button
  >
</div>
<div class="z-20 w-full xl:w-1/2">
  <Input
    icon="search"
    id="schedule-name-filter"
    label="Schedule Name"
    bind:value={search}
    on:input={(e) => (search = e.target.value)}
    on:submit={noop}
  />
</div>

{#if $loading}
  <Loading />
{:else if $schedules?.length}
  <Pagination
    items={filteredSchedules($schedules)}
    updating={$updating}
    let:visibleItems
  >
    <Table {columns}>
      {#each visibleItems as schedule}
        <ScheduleRow {schedule} {namespace} />
      {/each}
    </Table>
  </Pagination>
{:else}
  <div class="my-12 flex flex-col items-center justify-start gap-2">
    <EmptyState
      title={'No Schedules Found'}
      content={errorMessage}
      error={$scheduleError}
    />
    <Button primary as="anchor">Get Started With Docs</Button>
  </div>
{/if}
