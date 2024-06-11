<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { getMillisecondDuration } from '$lib/utilities/format-time';

  import type { Deployment } from './deployments';

  export let deployment: Deployment;

  $: startTime = new Date(
    deployment[0]?.startTime || deployment[0].expectedStartTime,
  );
  $: now = new Date();
  $: endTime = new Date(
    deployment[deployment.length - 1]?.endTime ||
      deployment[deployment.length - 1].expectedStartTime,
  );

  $: duration = getMillisecondDuration({
    start: startTime,
    end: endTime,
    onlyUnderSecond: false,
  });

  $: durationToNow = getMillisecondDuration({
    start: startTime,
    end: now,
    onlyUnderSecond: false,
  });

  let nowInterval;

  const clearNowInterval = (endTime: string) => {
    if (endTime) {
      clearInterval(nowInterval);
    }
  };

  onMount(() => {
    nowInterval = setInterval(() => {
      now = new Date();
    }, 1000);
  });

  $: clearNowInterval(deployment[deployment.length - 1]?.endTime);

  onDestroy(() => {
    clearInterval(nowInterval);
  });
</script>

<slot {startTime} {endTime} {duration} {durationToNow} />
