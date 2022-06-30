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
  import Link from '$lib/components/link.svelte';

  import ScheduleFrequency from './schedule-frequency.svelte';

  export let namespace: string;
  export let schedule;

  const getRoute = (item: WorkflowExecution) =>
    routeForSchedule({
      namespace,
      scheduleId: item.scheduleId,
    });
</script>

<a sveltekit:prefetch href={getRoute(schedule)} class="row">
  <div class="cell">Status</div>
  <div class="cell truncate">
    {schedule.scheduleId}
  </div>
  <div class="cell">Workflow Name</div>
  <div class="cell hidden xl:table-cell links">Recent actions</div>
  <div class="cell hidden xl:table-cell">Future action times</div>
</a>

<!-- <a sveltekit:prefetch href={getRoute(schedule)} class="row">
  <div class="cell">
    <WorkflowStatus
      status={schedule?.schedule?.state?.paused ? 'Paused' : 'Running'}
    />
  </div>
  <div class="cell truncate">
    {schedule.scheduleId}
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
</a> -->
<style lang="postcss">
  .row {
    @apply block h-36 items-center border-b-2 p-2 text-sm no-underline last-of-type:border-b-0 xl:table-row xl:text-base;
  }

  .row:hover {
    @apply bg-gray-50;
  }

  .cell {
    @apply border-gray-700 p-2 text-left xl:table-cell xl:border-b-2;
  }

  .table-link {
    @apply group-hover:text-blue-700 group-hover:underline group-hover:decoration-blue-700;
  }

  .row:last-of-type .cell {
    @apply border-b-0 first-of-type:rounded-bl-lg  last-of-type:rounded-br-lg;
  }
</style>
