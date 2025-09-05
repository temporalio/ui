<script lang="ts">
  import Input from '$lib/anthropocene/input/input.svelte';
  import ToggleButton from '$lib/anthropocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/anthropocene/toggle-button/toggle-buttons.svelte';

  interface Props {
    hour?: string;
    minute?: string;
    second?: string;
    half?: 'AM' | 'PM';
    twelveHourClock?: boolean;
    includeSeconds?: boolean;
    disabled?: boolean;
    ontimechange?: (value: string) => void;
  }

  let {
    hour = $bindable(''),
    minute = $bindable(''),
    second = $bindable(''),
    half = $bindable('AM' as 'AM' | 'PM'),
    twelveHourClock = true,
    includeSeconds = true,
    disabled = false,
    ontimechange,
  }: Props = $props();

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    ontimechange?.(target.value);
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
    oninput={onInput}
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
    oninput={onInput}
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
      oninput={onInput}
    />
  {/if}
  {#if twelveHourClock}
    <ToggleButtons>
      <ToggleButton active={half === 'AM'} onclick={() => (half = 'AM')}
        >AM</ToggleButton
      >
      <ToggleButton active={half === 'PM'} onclick={() => (half = 'PM')}
        >PM</ToggleButton
      >
    </ToggleButtons>
  {/if}
</div>
