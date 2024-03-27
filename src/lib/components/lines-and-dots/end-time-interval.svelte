<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { workflowRun } from '$lib/stores/workflow-run';
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  $: ({ workflow } = $workflowRun);
  $: endTime = workflow?.endTime || new Date();
  $: duration = getMillisecondDuration({
    start: workflow?.startTime,
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
    if (!workflow.endTime) {
      endTimeInterval = setInterval(() => {
        endTime = new Date();
      }, 1000);
    }
  });

  $: clearEndTimeInterval(workflow.endTime);

  onDestroy(() => {
    clearInterval(endTimeInterval);
  });
</script>

<slot {endTime} {duration} />
