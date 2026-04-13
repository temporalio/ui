<script lang="ts">
  import Timestamp from '$lib/components/timestamp.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { toWorkflowStatusReadable } from '$lib/utilities/screaming-enums';

  import WorkflowStatus from '../workflow-status.svelte';

  import type { DescribeScheduleResponse, ScheduleActionResult } from '$types';

  type Props = {
    namespace: string;
    schedule: DescribeScheduleResponse;
  };

  let { namespace, schedule }: Props = $props();
  const recentRuns = $derived(schedule?.info?.recentActions);

  const sortRecentRuns = (recentRuns: ScheduleActionResult[]) => {
    return (
      recentRuns
        ?.sort(
          (a, b) =>
            new Date(b.actualTime as string).getTime() -
            new Date(a.actualTime as string).getTime(),
        )
        ?.slice(0, 5) ?? []
    );
  };

  const sortedRuns = $derived(sortRecentRuns(recentRuns));
</script>

{#each sortedRuns as run, i (`${run?.startWorkflowResult?.workflowId ?? i}:${run?.startWorkflowResult?.runId ?? i + 1}`)}
  <div
    class="my-1 inline-flex w-full items-center justify-between border-b border-subtle py-1"
  >
    <div class="w-28">
      <WorkflowStatus
        status={toWorkflowStatusReadable(run.startWorkflowStatus)}
      />
    </div>
    <div class="mx-2 w-auto break-words">
      <Link
        href={routeForWorkflow({
          workflow: run.startWorkflowResult.workflowId,
          run: run.startWorkflowResult.runId,
          namespace,
        })}
      >
        {run.startWorkflowResult.workflowId}
      </Link>
    </div>
    <div class="ml-auto font-mono">
      <Timestamp as="p" dateTime={run.actualTime} />
    </div>
  </div>
{:else}
  <EmptyState title={translate('schedules.recent-runs-empty-state-title')} />
{/each}
