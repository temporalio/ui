<script lang="ts">
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import Input from '$lib/holocene/input/input.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';

  interface Props {
    class?: ClassNameValue;
    hour?: string;
    minute?: string;
    second?: string;
    half?: 'AM' | 'PM';
    twelveHourClock?: boolean;
    includeSeconds?: boolean;
    disabled?: boolean;
    error?: boolean;
    idPrefix?: string;
    onTimeChange?: (value: string) => void;
  }

  let {
    class: className = '',
    hour = $bindable(''),
    minute = $bindable(''),
    second = $bindable(''),
    half = $bindable('AM'),
    twelveHourClock = true,
    includeSeconds = true,
    disabled = false,
    error = false,
    idPrefix = '',
    onTimeChange,
  }: Props = $props();

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    onTimeChange?.(target.value);
  };
</script>

<div class={merge('flex gap-2', className)}>
  <Input
    id="{idPrefix}hour"
    label="hrs"
    labelHidden
    bind:value={hour}
    placeholder="00"
    suffix="hrs"
    maxLength={2}
    hideCount
    error={error ||
      (twelveHourClock ? parseInt(hour) > 12 : parseInt(hour) > 23)}
    {disabled}
    oninput={onInput}
  />
  <Input
    id="{idPrefix}minute"
    label="min"
    labelHidden
    bind:value={minute}
    placeholder="00"
    suffix="min"
    maxLength={2}
    hideCount
    error={error || Boolean(parseInt(minute) > 59)}
    {disabled}
    oninput={onInput}
  />
  {#if includeSeconds}
    <Input
      id="{idPrefix}second"
      label="sec"
      labelHidden
      bind:value={second}
      placeholder="00"
      suffix="sec"
      maxLength={2}
      hideCount
      error={error || Boolean(parseInt(second) > 59)}
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
