<script>import { page } from '$app/stores';
import { timeFormat } from '../../stores/time-format';
import { formatDate } from '../../utilities/format-date';
import { routeForSchedule, routeForWorkflow } from '../../utilities/route-for';
import WorkflowStatus from '../workflow-status.svelte';
import Link from '../../holocene/link.svelte';
import ScheduleFrequency from './schedule-frequency.svelte';
import TableRow from '../../holocene/table/table-row.svelte';
let { namespace } = $page.params;
export let schedule;
const getRoute = () => routeForSchedule({
    namespace,
    scheduleId: schedule === null || schedule === void 0 ? void 0 : schedule.scheduleId,
});
</script>

<TableRow href={getRoute()} class="schedule-row">
  <td class="cell">
    <WorkflowStatus status={schedule?.info?.paused ? 'Paused' : 'Running'} />
  </td>
  <td class="cell truncate">
    {schedule.scheduleId}
    <p>
      <small class="text-gray-900"
        ><ScheduleFrequency
          calendar={schedule?.info?.spec?.calendar?.[0]}
          interval={schedule?.info?.spec?.interval?.[0]}
        /></small
      >
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

<style>
  .cell {
    padding: 0.5rem;
    text-align: left
}</style>
