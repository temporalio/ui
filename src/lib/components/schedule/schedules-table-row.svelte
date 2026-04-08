<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { decodePayloadAttributes } from '$lib/utilities/decode-payload';
  import { routeForSchedule, routeForWorkflow } from '$lib/utilities/route-for';

  import ScheduleFrequency from './schedule-frequency.svelte';

  import type { ScheduleActionResult, ScheduleListEntry } from '$types';

  const { namespace } = $derived(page.params);

  type Props = {
    schedule: ScheduleListEntry;
    columns: ConfigurableTableHeader[];
  };

  let { schedule, columns }: Props = $props();

  const spec = $derived(schedule?.info?.spec);
  const searchAttributes = $derived(schedule?.searchAttributes ?? {});
  const decodedAttributes = $derived(
    decodePayloadAttributes({ searchAttributes }),
  );

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

  const route = $derived(
    routeForSchedule({
      namespace,
      scheduleId: schedule.scheduleId,
    }),
  );
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
              href={routeForWorkflow({
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
        <ScheduleFrequency {spec} />
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
