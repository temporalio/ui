<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { getRecentScheduleActions } from '$lib/components/schedule/utilities/recent-actions';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Link from '$lib/holocene/link.svelte';
  import {
    COLUMN_WIDTH_CLAMP_CLASSES,
    columnWidthStyle,
  } from '$lib/utilities/column-width';
  import { routeForWorkflow } from '$lib/utilities/route-for';

  import type { WorkflowScheduleListEntry } from '../../types';

  type Props = {
    schedule: WorkflowScheduleListEntry;
    namespace: string;
    width?: number;
  };

  let { schedule, namespace, width }: Props = $props();

  const widthStyle = $derived(columnWidthStyle(width));
  const clampToWidth = $derived(
    width !== undefined && COLUMN_WIDTH_CLAMP_CLASSES,
  );
  const recentActions = $derived(
    getRecentScheduleActions(schedule.info.recentActions ?? []),
  );
</script>

<td class={twMerge('truncate p-2 text-left', clampToWidth)} style={widthStyle}>
  {#each recentActions as run (run)}
    {@const startWorkflowResult = run.startWorkflowResult}
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
