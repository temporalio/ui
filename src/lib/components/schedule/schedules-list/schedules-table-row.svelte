<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import WorkflowStatus from '$lib/components/execution-status.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TableCellWithFilterOrCopyButtons from '$lib/holocene/table/table-cell-with-filter-or-copy-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { parsePayloadAttributes } from '$lib/utilities/decode-payload';
  import {
    routeForSchedule,
    routeForWorkflow,
    routeForWorkflowsWithQuery,
  } from '$lib/utilities/route-for';

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
    parsePayloadAttributes({ searchAttributes }),
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

  const route = $derived.by(() => {
    return routeForSchedule({
      namespace,
      scheduleId: schedule.scheduleId ?? '',
    });
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
      {@const workflowTypeName = schedule?.info?.workflowType?.name ?? ''}
      {@const filterRoute = routeForWorkflowsWithQuery({
        namespace,
        query: [
          workflowTypeName && `WorkflowType="${workflowTypeName}"`,
          schedule?.scheduleId &&
            `TemporalScheduledById="${schedule.scheduleId}"`,
        ]
          .filter(Boolean)
          .join(' AND '),
      })}
      <TableCellWithFilterOrCopyButtons
        class="cell whitespace-pre-line break-words"
        filterIconTitle={translate('common.filter-workflows')}
        copyValue={workflowTypeName ?? undefined}
        onFilter={() => {
          if (filterRoute) {
            goto(filterRoute);
          }
        }}
      >
        {#if filterRoute}
          <Link href={filterRoute}>
            {workflowTypeName}
          </Link>
        {:else}
          {workflowTypeName}
        {/if}
      </TableCellWithFilterOrCopyButtons>
    {:else if label === translate('schedules.recent-runs')}
      <td class="cell truncate">
        {#each sortRecentActions(schedule?.info?.recentActions ?? []) as run (run?.actualTime)}
          {@const startWorkflowResult = run?.startWorkflowResult}
          <p>
            {#if startWorkflowResult && startWorkflowResult.workflowId && startWorkflowResult.runId}
              <Link
                href={routeForWorkflow({
                  namespace,
                  workflow: startWorkflowResult.workflowId,
                  run: startWorkflowResult.runId,
                })}
              >
                <Timestamp dateTime={run.actualTime} />
              </Link>
            {:else}
              <Timestamp dateTime={run.actualTime} />
            {/if}
          </p>
        {/each}
      </td>
    {:else if label === translate('schedules.upcoming-runs')}
      <td class="cell truncate">
        {#each schedule?.info?.futureActionTimes?.slice(0, 5) ?? [] as run (run)}
          <Timestamp as="div" dateTime={run} />
        {/each}
      </td>
    {:else if label === translate('schedules.schedule-spec')}
      <td class="cell">
        {#if spec}
          <ScheduleFrequency {spec} />
        {/if}
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
