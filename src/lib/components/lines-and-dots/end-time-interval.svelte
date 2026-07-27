<script lang="ts">
  import type { Timestamp } from '@temporalio/common';
  import { onDestroy } from 'svelte';

  import { pauseLiveUpdates } from '$lib/stores/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  export let workflow: WorkflowExecution;
  export let startTime: string | Timestamp;

  let currentTime = Date.now();

  const rightNow = () => {
    currentTime = Date.now();
    return currentTime + 1000;
  };

  $: endTime = workflow?.endTime || rightNow();
  $: duration = getMillisecondDuration({
    start: startTime,
    end: endTime,
    onlyUnderSecond: false,
  });

  let endTimeInterval;

  const clearEndTimeInterval = (endTime: string) => {
    if (endTime) {
      clearInterval(endTimeInterval);
      endTimeInterval = null;
    }
  };

  const startStopInterval = (pauseLiveUpdates) => {
    if (pauseLiveUpdates) {
      clearInterval(endTimeInterval);
      endTimeInterval = null;
    } else if (!endTimeInterval && (workflow.isRunning || workflow.isPaused)) {
      endTimeInterval = setInterval(() => {
        endTime = rightNow();
      }, 1000);
    }
  };

  $: clearEndTimeInterval(workflow.endTime);
  $: startStopInterval($pauseLiveUpdates);

  onDestroy(() => {
    clearInterval(endTimeInterval);
    endTimeInterval = null;
    $pauseLiveUpdates = false;
  });
</script>

<slot {endTime} {duration} {currentTime} />
