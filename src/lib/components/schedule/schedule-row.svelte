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
  import { routeForSchedule, routeForWorkflow } from '$lib/utilities/route-for';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import { fetchSchedule } from '$lib/services/schedule-service';
  import { decodeURIForSvelte } from '$lib/utilities/encode-uri';
  import Link from '$lib/components/link.svelte';

  import { onMount } from 'svelte';
  import ScheduleFrequency from './schedule-frequency.svelte';

  export let namespace: string;
  export let item;

  let schedule = new Promise(() => []);
  onMount(() => {
    schedule = fetchSchedule(
      { namespace, scheduleId: decodeURIForSvelte(item.scheduleId) },
      fetch,
    );
  });

  const getRoute = (item: WorkflowExecution) =>
    routeForSchedule({
      namespace,
      scheduleId: item.scheduleId,
    });
</script>

{#await schedule}
  <div class="row">
    <div class="cell" />
    <div class="cell">{item.scheduleId}</div>
    <div class="cell" />
    <div class="cell hidden xl:table-cell" />
    <div class="cell hidden xl:table-cell" />
  </div>
{:then schedule}
  <a sveltekit:prefetch href={getRoute(item)} class="row">
    <div class="cell">
      <WorkflowStatus
        status={schedule?.schedule?.state?.paused ? 'Paused' : 'Running'}
      />
    </div>
    <div class="cell truncate">
      {item.scheduleId}
      <p>
        <small class="text-gray-900"
          ><ScheduleFrequency
            calendar={schedule?.schedule?.spec?.calendar?.[0]}
            interval={schedule?.schedule?.spec?.interval?.[0]}
          /></small
        >
      </p>
    </div>
    <div class="cell">
      {schedule?.schedule?.action?.startWorkflow?.workflowType?.name}
    </div>
    <div class="cell hidden xl:table-cell links">
      {#each schedule?.info?.recentActions?.reverse().slice(0, 5) ?? [] as run}
        <p>
          <Link
            href={routeForWorkflow({
              namespace,
              workflow: run.startWorkflowResult.workflowId,
              run: run.startWorkflowResult.runId,
            })}>{formatDate(run.actualTime, $timeFormat)}</Link
          >
        </p>
      {/each}
    </div>
    <div class="cell hidden xl:table-cell">
      {#each schedule?.info?.futureActionTimes?.slice(0, 5) ?? [] as run}
        <div>{formatDate(run, $timeFormat, 'from now')}</div>
      {/each}
    </div>
  </a>
{/await}

<style lang="postcss">
  .row {
    @apply block h-36 no-underline p-2 text-sm border-b-2 items-center xl:text-base xl:table-row last-of-type:border-b-0;
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
