<script lang="ts">
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
  import NamespaceSelector from '$lib/holocene/namespace-selector.svelte';
  import { fetchAllSchedules } from '$lib/services/schedule-service';

  let { namespace } = $page.params;

  let search = '';

  $: fetchSchedules = fetchAllSchedules(namespace);

  $: filteredSchedules = (schedules) =>
    search
      ? schedules.filter((schedule) => schedule.scheduleId.includes(search))
      : schedules;

  const errorMessage =
    'Create scheduled actions using our Public API or TCTL (CLI).';
</script>

<div class="flex flex-row justify-between">
  <h2 class="text-2xl">
    Schedules <NamespaceSelector /><Badge type="alpha">Alpha</Badge>
  </h2>
  <Button
    class="h-10"
    primary
    on:click={() => goto(routeForScheduleCreate({ namespace }))}
    >Create Schedule</Button
  >
</div>
<div class="w-full xl:w-1/2">
  <Input
    icon="search"
    id="schedule-name-filter"
    label="Schedule Name"
    bind:value={search}
    on:input={(e) => (search = e.target.value)}
    on:submit={noop}
  />
</div>

{#await fetchSchedules}
  <Loading />
{:then { schedules }}
  {#if schedules?.length}
    <Pagination items={filteredSchedules(schedules)} let:visibleItems>
      <Table {columns}>
        {#each visibleItems as schedule}
          <ScheduleRow {schedule} {namespace} />
        {/each}
      </Table>
    </Pagination>
  {:else}
    <div class="my-12 flex flex-col items-center justify-start gap-2">
      <EmptyState title={'No Schedules Found'} content={errorMessage} />
      <Button primary as="anchor">Get Started With Docs</Button>
    </div>
  {/if}
{:catch error}
  <div class="my-12 flex flex-col items-center justify-start gap-2">
    <EmptyState
      title={'No Schedules Found'}
      content={errorMessage}
      error={error.toString()}
    />
    <Button primary as="anchor">Get Started With Docs</Button>
  </div>
{/await}
