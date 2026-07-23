<script lang="ts">
  import type { Timestamp } from '@temporalio/common';
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';

  import { pauseLiveUpdates } from '$lib/stores/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  interface Props {
    workflow: WorkflowExecution;
    startTime: string | Timestamp;
    currentTime?: number;
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
    children,
  }: Props = $props();

  let endTime = $derived(workflow?.endTime || currentTime + 1000);
  let duration = $derived(
    getMillisecondDuration({
      start: startTime,
      end: endTime,
      onlyUnderSecond: false,
    }),
  );

  let endTimeInterval: ReturnType<typeof setInterval> | null = $state(null);

  const clearEndTimeInterval = (endTime: string) => {
    if (endTime) {
      clearInterval(endTimeInterval ?? undefined);
      endTimeInterval = null;
    }
  };

  const startStopInterval = (pauseLiveUpdates: boolean) => {
    if (pauseLiveUpdates) {
      clearInterval(endTimeInterval ?? undefined);
      endTimeInterval = null;
    } else if (!endTimeInterval && (workflow.isRunning || workflow.isPaused)) {
      endTimeInterval = setInterval(() => {
        currentTime = Date.now();
      }, 1000);
    }
  };

  $effect(() => {
    clearEndTimeInterval(workflow.endTime);
  });
  $effect(() => {
    startStopInterval($pauseLiveUpdates);
  });

  onDestroy(() => {
    clearInterval(endTimeInterval ?? undefined);
    endTimeInterval = null;
    $pauseLiveUpdates = false;
  });
</script>

{@render children?.({ endTime, duration, currentTime })}
