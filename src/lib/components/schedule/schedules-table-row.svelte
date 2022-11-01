<script lang="ts">
  import type { ScheduleListEntry } from '$types';
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { routeForSchedule, routeForWorkflow } from '$lib/utilities/route-for';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';

  import ScheduleFrequency from './schedule-frequency.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';

  let { namespace } = $page.params;
  export let schedule: ScheduleListEntry;

  const getRoute = () =>
    routeForSchedule({
      namespace,
      scheduleId: schedule?.scheduleId as string,
    });
</script>

<TableRow href={getRoute()} class="schedule-row">
  <td class="cell">
    <WorkflowStatus status={schedule?.info?.paused ? 'Paused' : 'Running'} />
  </td>
  <td class="cell truncate">
    {schedule.scheduleId}
    <p>
      <ScheduleFrequency
        calendar={schedule?.info?.spec?.structuredCalendar?.[0]}
        interval={schedule?.info?.spec?.interval?.[0]}
      />
    </p>
  </td>
  <td class="cell hidden md:table-cell">
    {schedule?.info?.workflowType?.name}
  </td>
  <td class="cell links hidden xl:table-cell">
    {#each schedule?.info?.recentActions?.reverse().slice(0, 5) ?? [] as run}
      <p>
        <Link
          href={routeForWorkflow({
            namespace,
            workflow: run?.startWorkflowResult?.workflowId,
            run: run?.startWorkflowResult?.runId,
          })}>{formatDate(run?.actualTime, $timeFormat)}</Link
        >
      </p>
    {/each}
  </td>
  <td class="cell hidden xl:table-cell">
    {#each schedule?.info?.futureActionTimes?.slice(0, 5) ?? [] as run}
      <div>{formatDate(run, $timeFormat, 'from now')}</div>
    {/each}
  </td>
</TableRow>

<style lang="postcss">
  .cell {
    @apply p-2 text-left;
  }
</style>
