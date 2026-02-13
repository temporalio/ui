<script lang="ts">
  import { page } from '$app/stores';

  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { decodePayloadAttributes } from '$lib/utilities/decode-payload';
  import { routeForSchedule, routeForTimeline } from '$lib/utilities/route-for';

  import ScheduleBasicFrequency from './schedule-basic-frequency.svelte';

  import type { ScheduleActionResult, ScheduleListEntry } from '$types';

  let { namespace } = $page.params;

  export let schedule: ScheduleListEntry;
  export let columns: ConfigurableTableHeader[];

  $: spec = schedule?.info?.spec;
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

<tr class="max-h-32">
  {#each columns as { label } (label)}
    {#if label === translate('common.status')}
      <td class="cell">
        <WorkflowStatus
          status={schedule?.info?.paused ? 'Paused' : 'Running'}
        />
      </td>
    {:else if label === translate('schedules.id')}
      <td class="cell whitespace-pre-line break-words">
        <Link href={route}>{schedule.scheduleId}</Link>
      </td>
    {:else if label === translate('common.workflow-type')}
      <td class="cell whitespace-pre-line break-words">
        {schedule?.info?.workflowType?.name ?? ''}
      </td>
    {:else if label === translate('schedules.recent-runs')}
      <td class="cell truncate">
        {#each sortRecentActions(schedule?.info?.recentActions) as run}
          <p>
            <Link
              href={routeForTimeline({
                namespace,
                workflow: run?.startWorkflowResult?.workflowId,
                run: run?.startWorkflowResult?.runId,
              })}
            >
              <Timestamp dateTime={run.actualTime} />
            </Link>
          </p>
        {/each}
      </td>
    {:else if label === translate('schedules.upcoming-runs')}
      <td class="cell truncate">
        {#each schedule?.info?.futureActionTimes?.slice(0, 5) ?? [] as run}
          <Timestamp as="div" dateTime={run} />
        {/each}
      </td>
    {:else if label === translate('schedules.schedule-spec')}
      <td class="cell">
        <p>{@html translate('common.timezone', { timezone: timezoneName })}</p>
        <ScheduleBasicFrequency
          frequency={[
            ...(spec?.structuredCalendar ?? []),
            ...(spec?.interval ?? []),
          ]}
        />
      </td>
    {:else}
      <td class="cell">
        {decodedAttributes?.searchAttributes?.indexedFields?.[label] ?? ''}
      </td>
    {/if}
  {/each}
</tr>

<style lang="postcss">
  .cell {
    @apply p-2 text-left;
  }
</style>
