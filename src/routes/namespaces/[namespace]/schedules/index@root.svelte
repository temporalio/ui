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
  import { getSchedules } from '$lib/stores/schedules';
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
  import TableRow from '$lib/components/table/row.svelte';
  import Search from '$lib/components/search.svelte';

  import { columns } from './_schedule-table-columns';
  import { noop } from 'svelte/internal';
  import { stringify } from 'postcss';

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
          <a sveltekit:prefetch href={getRoute(event)} class="row">
            {#await fetchSchedule({ namespace, scheduleId: decodeURIForSvelte(event.scheduleId) }, fetch)}
              <div class="cell" />
              <div class="cell" />
              <div class="cell" />
              <div class="cell hidden xl:table-cell" />
              <div class="cell hidden xl:table-cell" />
            {:then schedule}
              <div class="cell">
                <WorkflowStatus />
              </div>
              <div class="cell truncate">
                {event.scheduleId}
                <p>
                  <small class="text-gray-700"
                    >{JSON.stringify(
                      schedule?.schedule?.spec?.calendar?.[0] ??
                        schedule?.schedule?.spec?.interval?.[0],
                    )}</small
                  >
                </p>
              </div>
              <div class="cell">
                {schedule?.schedule?.action?.startWorkflow?.workflowType?.name}
              </div>
              <div class="cell hidden xl:table-cell">
                {#each schedule?.info?.recentActions
                  ?.reverse()
                  .slice(0, 5) ?? [] as run}
                  <div>{formatDate(run.actualTime, $timeFormat)}</div>
                {/each}
              </div>
              <div class="cell hidden xl:table-cell">
                {#each schedule?.info?.futureActionTimes?.slice(0, 5) ?? [] as run}
                  <div>{formatDate(run, $timeFormat, 'from now')}</div>
                {/each}
              </div>
            {/await}
          </a>
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
