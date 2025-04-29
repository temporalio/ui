<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import { decodePayloadAttributes } from '$lib/utilities/decode-payload';
  import { formatDate } from '$lib/utilities/format-date';
  import {
    routeForEventHistory,
    routeForSchedule,
  } from '$lib/utilities/route-for';

  import ScheduleBasicFrequency from './schedule-basic-frequency.svelte';

  import type { ScheduleActionResult, ScheduleListEntry } from '$types';

  let { namespace } = $page.params;

  export let schedule: ScheduleListEntry;
  export let columns: ConfigurableTableHeader[];

  $: spec = schedule?.info?.spec;
  $: calendar = spec?.structuredCalendar?.[0];
  $: interval = spec?.interval?.[0];
  $: timezoneName = spec?.timezoneName || 'UTC';
  $: searchAttributes = schedule?.searchAttributes ?? {};
  $: decodedAttributes = decodePayloadAttributes({ searchAttributes });

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

<tr>
  {#each columns as { label } (label)}
    {#if label === translate('common.status')}
      <td class="cell">
        <WorkflowStatus
          status={schedule?.info?.paused ? 'Paused' : 'Running'}
        />
      </td>
    {:else if label === translate('schedules.id')}
      <td class="cell break-words whitespace-pre-line">
        <Link href={route}>{schedule.scheduleId}</Link>
      </td>
    {:else if label === translate('common.workflow-type')}
      <td class="cell break-words whitespace-pre-line">
        {schedule?.info?.workflowType?.name ?? ''}
      </td>
    {:else if label === translate('schedules.recent-runs')}
      <td class="cell truncate">
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
    {:else if label === translate('schedules.upcoming-runs')}
      <td class="cell truncate">
        {#each schedule?.info?.futureActionTimes?.slice(0, 5) ?? [] as run}
          <div>
            {formatDate(run, $timeFormat, {
              relative: $relativeTime,
              relativeLabel: translate('common.from-now'),
            })}
          </div>
        {/each}
      </td>
    {:else if label === translate('schedules.schedule-spec')}
      <td class="cell">
        <p>{@html translate('common.timezone', { timezone: timezoneName })}</p>
        <ScheduleBasicFrequency {calendar} {interval} />
      </td>
    {:else}
      <td class="cell">
        {decodedAttributes?.searchAttributes?.indexedFields?.[label] ?? ''}
      </td>
    {/if}
  {/each}
</tr>

<style lang="postcss">
  @reference "tailwindcss";

  .cell {
    @apply p-2 text-left;
  }
</style>
