<script lang="ts">
  import type { ScheduleActionResult, ScheduleListEntry } from '$types';
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

  const spec: FullScheduleSpec = schedule?.info?.spec;
  const calendar: FullCalendarSpec = spec?.structuredCalendar?.[0];
  const interval = spec?.interval?.[0];

  const sortRecentActions = (recentActions: ScheduleActionResult[]) => {
    return (
      recentActions
        ?.sort(
          (a, b) =>
            new Date(b.actualTime as string).getTime() -
            new Date(a.actualTime as string).getTime(),
        )
        .slice(0, 5) ?? []
    );
  };

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
  <td class="cell whitespace-pre-line break-words">
    <p class="text-base">{schedule.scheduleId}</p>
    <p>
      <ScheduleFrequency {calendar} {interval} class="text-sm" />
    </p>
  </td>
  <td class="cell hidden whitespace-pre-line break-words md:table-cell">
    {schedule?.info?.workflowType?.name ?? ''}
  </td>
  <td class="cell links hidden truncate xl:table-cell">
    {#each sortRecentActions(schedule?.info?.recentActions) as run}
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
  <td class="cell hidden truncate xl:table-cell">
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
