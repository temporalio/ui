<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import { translate } from '$lib/i18n/translate';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type {
    FullScheduleSpec,
    StructuredCalendar,
  } from '$lib/types/schedule';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    routeForEventHistory,
    routeForSchedule,
  } from '$lib/utilities/route-for';

  import ScheduleFrequency from './schedule-frequency.svelte';

  import type { ScheduleActionResult, ScheduleListEntry } from '$types';

  let { namespace } = $page.params;

  export let schedule: ScheduleListEntry;

  const spec: FullScheduleSpec = schedule?.info?.spec;
  const calendar: StructuredCalendar = spec?.structuredCalendar?.[0];
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

  $: route = routeForSchedule({
    namespace,
    scheduleId: schedule?.scheduleId as string,
  });
</script>

<TableRow class="schedule-row">
  <td class="cell">
    <WorkflowStatus status={schedule?.info?.paused ? 'Paused' : 'Running'} />
  </td>
  <td class="cell whitespace-pre-line break-words">
    <Link class="text-base" href={route}>
      {schedule.scheduleId}
    </Link>
  </td>
  <td class="cell whitespace-pre-line break-words max-md:hidden">
    {schedule?.info?.workflowType?.name ?? ''}
  </td>
  <td class="cell links truncate max-xl:hidden">
    {#each sortRecentActions(schedule?.info?.recentActions) as run}
      <p>
        <Link
          href={routeForEventHistory({
            namespace,
            workflow: run?.startWorkflowResult?.workflowId,
            run: run?.startWorkflowResult?.runId,
          })}
          >{formatDate(run?.actualTime, $timeFormat, {
            relative: $relativeTime,
          })}</Link
        >
      </p>
    {/each}
  </td>
  <td class="cell truncate max-xl:hidden">
    {#each schedule?.info?.futureActionTimes?.slice(0, 5) ?? [] as run}
      <div>
        {formatDate(run, $timeFormat, {
          relative: $relativeTime,
          relativeLabel: translate('from-now'),
        })}
      </div>
    {/each}
  </td>
</TableRow>
<TableRow class="row">
  <td colspan="5" class="hidden xl:table-cell !p-0">
    <ScheduleFrequency {calendar} {interval} inline class="text-sm w-auto" />
  </td>
  <td colspan="3" class="hidden md:table-cell xl:hidden !p-0">
    <ScheduleFrequency {calendar} {interval} inline class="text-sm w-auto" />
  </td>
  <td colspan="2" class="md:hidden !p-0">
    <ScheduleFrequency {calendar} {interval} inline class="text-sm w-auto" />
  </td>
</TableRow>

<style lang="postcss">
  .cell {
    @apply p-2 text-left;
  }

  :global(.row td) {
    @apply !border-t-0;
  }
</style>
