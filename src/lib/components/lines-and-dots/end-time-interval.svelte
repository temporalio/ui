<script lang="ts">
  import type { Timestamp } from '@temporalio/common';
  import { onDestroy, onMount } from 'svelte';

  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  export let workflow: WorkflowExecution | undefined = undefined;
  export let startTime: string | Timestamp;

  $: endTime = workflow?.endTime || new Date();
  $: duration = getMillisecondDuration({
    start: startTime,
    end: endTime,
    onlyUnderSecond: false,
  });

  let endTimeInterval;

  const clearEndTimeInterval = (endTime: string) => {
    if (endTime) {
      clearInterval(endTimeInterval);
    }
  };

  onMount(() => {
    if (!workflow?.endTime) {
      endTimeInterval = setInterval(() => {
        endTime = new Date();
      }, 1000);
    }
  });

  $: clearEndTimeInterval(workflow?.endTime);

  onDestroy(() => {
    clearInterval(endTimeInterval);
  });
</script>

<slot {endTime} {duration} />
