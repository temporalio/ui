<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params }) {
    const { namespace } = params;

    return {
      props: { namespace },
    };
  };
</script>

<script lang="ts">
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { fetchAllSchedules } from '$lib/services/schedule-service';
  import { routeForSchedule } from '$lib/utilities/route-for';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import { fetchSchedule } from '$lib/services/schedule-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Button from '$lib/components/button.svelte';
  import Badge from '$lib/components/badge.svelte';
  import Loading from '$lib/components/loading.svelte';
  import Table from '$lib/components/table/index.svelte';
  import ScheduleRow from '$lib/components/schedule/schedule-row.svelte';
  import Search from '$lib/components/search.svelte';

  import { columns } from './_schedule-table-columns';
  import { noop, onMount } from 'svelte/internal';

  export let namespace: string;

  let schedules = new Promise(() => []);
  onMount(() => {
    schedules = fetchAllSchedules(namespace);
  });

  let search = '';

  $: filteredSchedules = (schedules) =>
    search
      ? schedules.filter((schedule) => schedule.scheduleId.includes(search))
      : schedules;

  const errorMessage =
    'Create scheduled actions using our Public API or TCTL (CLI).';
</script>

<h2 class="text-2xl">Schedules <Badge type="beta">Beta</Badge></h2>
<Search
  icon
  placeholder="Search"
  value={search}
  on:input={(e) => (search = e.target.value)}
  on:submit={noop}
/>
{#await schedules}
  <Loading />
{:then { schedules }}
  {#if schedules.length}
    <Pagination items={filteredSchedules(schedules)} let:visibleItems>
      <Table {columns}>
        {#each visibleItems as item}
          <ScheduleRow {item} {namespace} />
        {/each}
      </Table>
    </Pagination>
  {:else}
    <div class="my-12 flex flex-col justify-start items-center gap-2">
      <EmptyState title={'No Schedules Found'} content={errorMessage} />
      <Button primary as="anchor">Get Started With Docs</Button>
    </div>
  {/if}
{/await}

<style lang="postcss">
  .row {
    @apply block no-underline p-2 text-sm border-b-2 items-center xl:text-base xl:table-row last-of-type:border-b-0;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .cell {
    @apply xl:table-cell xl:border-b-2 border-gray-700 text-left p-2;
  }

  .table-link {
    @apply group-hover:text-blue-700 group-hover:underline group-hover:decoration-blue-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
