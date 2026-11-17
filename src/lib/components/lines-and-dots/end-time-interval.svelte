<script lang="ts">
  import type { Timestamp } from '@temporalio/common';
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';

  import { pauseLiveUpdates } from '$lib/stores/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import {
    getMillisecondDuration,
    getValidTimeMs,
  } from '$lib/utilities/format-time';
  import { getWorkflowLatestTime } from '$lib/utilities/workflow-time-skipping';

  interface Props {
    workflow: WorkflowExecution;
    startTime: string | Timestamp;
    currentTime?: number;
    latestEventTimeMs?: number;
    children?: Snippet<
      [
        {
          endTime: string | number;
          duration: number | null;
          currentTime: number;
        },
      ]
    >;
  }

  let {
    workflow,
    startTime,
    currentTime = $bindable(Date.now()),
    latestEventTimeMs,
    children,
  }: Props = $props();

  const virtualTimeMs = $derived(
    getValidTimeMs(
      workflow.workflowExtendedInfo?.timeSkippingInfo?.currentTime,
    ),
  );
  const endTime = $derived(
    workflow.endTime || currentTime + (virtualTimeMs === undefined ? 1000 : 0),
  );
  const duration = $derived(
    getMillisecondDuration({
      start: startTime,
      end: endTime,
      onlyUnderSecond: false,
    }),
  );

  $effect(() => {
    if ($pauseLiveUpdates) {
      return;
    }
    if (virtualTimeMs === undefined && !workflow.endTime) {
      return;
    }
    currentTime = getWorkflowLatestTime(
      workflow,
      Date.now(),
      latestEventTimeMs,
    );
  });

  $effect(() => {
    if ($pauseLiveUpdates || workflow.endTime || virtualTimeMs !== undefined) {
      return;
    }
    if (!(workflow.isRunning || workflow.isPaused)) {
      return;
    }

    currentTime = Date.now();
    const interval = setInterval(() => {
      currentTime = Date.now();
    }, 1000);
    return () => clearInterval(interval);
  });

  onDestroy(() => {
    $pauseLiveUpdates = false;
  });
</script>

{@render children?.({ endTime, duration, currentTime })}
