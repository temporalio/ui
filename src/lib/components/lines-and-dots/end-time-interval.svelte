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

  const endTime = $derived(workflow?.endTime || currentTime + 1000);
  const duration = $derived(
    getMillisecondDuration({
      start: startTime,
      end: endTime,
      onlyUnderSecond: false,
    }),
  );

  $effect(() => {
    if ($pauseLiveUpdates) return;
    if (workflow.endTime) return;
    if (!(workflow.isRunning || workflow.isPaused)) return;

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
