<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  export let onNowClick: () => void;

  let nowInterval;
  let now = new Date();
  let dayBuffer = 4;

  $: startTime = new Date(new Date().setDate(now.getDate() - dayBuffer));
  $: endTime = new Date(new Date().setDate(now.getDate() + dayBuffer));

  $: duration = getMillisecondDuration({
    start: startTime,
    end: endTime,
    onlyUnderSecond: false,
  });

  onMount(() => {
    nowInterval = setInterval(() => {
      now = new Date();
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(nowInterval);
  });

  const zoomIn = () => {
    if (dayBuffer === 1) return;
    dayBuffer = dayBuffer - 1;
  };

  const zoomOut = () => {
    dayBuffer = dayBuffer + 1;
  };
</script>

<div class="flex items-center justify-end">
  <ToggleButtons>
    <ToggleButton data-testid="now" on:click={onNowClick}>Now</ToggleButton>
    <ToggleButton
      data-testid="zoom-in"
      on:click={zoomIn}
      disabled={dayBuffer === 1}>+</ToggleButton
    >
    <ToggleButton data-testid="zoom-out" on:click={zoomOut}>-</ToggleButton>
  </ToggleButtons>
</div>
<slot {startTime} {endTime} {duration} {now} />
