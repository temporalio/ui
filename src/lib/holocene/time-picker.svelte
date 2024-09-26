<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Input from '$lib/holocene/input/input.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';

  export let hour = '';
  export let minute = '';
  export let second = '';
  export let half: 'AM' | 'PM' = 'AM';
  export let twelveHourClock = true;
  export let includeSeconds = true;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    dispatch('timechange', target.value);
  };
</script>

<div class="flex gap-2">
  <Input
    id="hour"
    label="hrs"
    labelHidden
    bind:value={hour}
    placeholder="00"
    suffix="hrs"
    maxLength={2}
    hideCount
    error={twelveHourClock ? parseInt(hour) > 12 : parseInt(hour) > 23}
    {disabled}
    on:input={onInput}
  />
  <Input
    id="minute"
    label="min"
    labelHidden
    bind:value={minute}
    placeholder="00"
    suffix="min"
    maxLength={2}
    hideCount
    error={Boolean(parseInt(hour) > 59)}
    {disabled}
    on:input={onInput}
  />
  {#if includeSeconds}
    <Input
      id="second"
      label="sec"
      labelHidden
      bind:value={second}
      placeholder="00"
      suffix="sec"
      maxLength={2}
      hideCount
      error={Boolean(parseInt(hour) > 59)}
      {disabled}
      on:input={onInput}
    />
  {/if}
  {#if twelveHourClock}
    <ToggleButtons>
      <ToggleButton active={half === 'AM'} on:click={() => (half = 'AM')}
        >AM</ToggleButton
      >
      <ToggleButton active={half === 'PM'} on:click={() => (half = 'PM')}
        >PM</ToggleButton
      >
    </ToggleButtons>
  {/if}
</div>
