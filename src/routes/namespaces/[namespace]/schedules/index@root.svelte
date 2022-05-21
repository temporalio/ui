<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit';

  import { getSearchType } from '$lib/utilities/search-type-parameter';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  const defaultQuery = toListWorkflowQuery({
    timeRange: '1 year',
  });

  export const load: Load = async function ({ params, url }) {
    const searchType = getSearchType(url);

    // url.searchParams.set('query', defaultQuery);
    // const query = url.searchParams.get('query');
    const { namespace } = params;

    return {
      props: { namespace, searchType },
    };
  };
</script>

<script lang="ts">
  import { timeFormat } from '$lib/stores/time-format';
  import { getSchedules } from '$lib/stores/schedules';
  import { routeForSchedule } from '$lib/utilities/route-for';

  import EmptyState from '$lib/components/empty-state.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Button from '$lib/components/button.svelte';
  import Badge from '$lib/components/badge.svelte';
  import Loading from '$lib/components/loading.svelte';
  import Table from '$lib/components/table/index.svelte';
  import TableRow from '$lib/components/table/row.svelte';
  import Search from '$lib/components/search.svelte';

  import { columns } from './_schedule-table-columns';
  import { noop } from 'svelte/internal';

  export let namespace: string;

  let schedules = getSchedules({ namespace });

  let search = '';
  const errorMessage =
    'Create scheduled actions using our Public API or TCTL (CLI).';

  const getRoute = (item: WorkflowExecution) =>
    routeForSchedule({
      namespace,
      scheduleId: item.scheduleId,
    });
</script>

<h2 class="text-2xl">Schedules <Badge type="beta">Beta</Badge></h2>
<div class="w-1/2">
  <Search icon placeholder="Search" value={search} on:submit={noop} />
</div>
{#await $schedules}
  <Loading />
{:then { schedules }}
  {#if schedules.length}
    <Pagination items={schedules} let:visibleItems>
      <Table {columns}>
        {#each visibleItems as event}
          <TableRow
            item={event}
            {columns}
            href={getRoute(event)}
            timeFormat={$timeFormat}
          />
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
