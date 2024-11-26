<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import Label from '$lib/holocene/label.svelte';
  import { omit } from '$lib/utilities/omit';

  interface $$Props extends HTMLInputAttributes {
    value: number;
    id: string;
    label: string;
    labelHidden?: boolean;
    min?: number;
    max?: number;
    step?: number;
    'data-testid'?: string;
  }

  export let label: string;
  export let labelHidden = false;
  export let min: number = undefined;
  export let max: number = undefined;
  export let step: number = undefined;
  export let id: string = undefined;
  export let value: number = Math.round((min + max) / 2);
  let valid = true;
  let outputElement: HTMLOutputElement;

  $: outputXPos = getOutputXPos({ value, min, max });
  $: outputXPosOffset = getOutputXPosOffset({ outputElement, outputXPos });
  $: {
    if (value) {
      outputXPos = getOutputXPos({ value, min, max });
      outputXPosOffset = getOutputXPosOffset({ outputElement, outputXPos });
    } else {
      outputXPos = 0;
      outputXPosOffset = 0;
    }
  }

  const handleInput = (
    event: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) => {
    if (Number.isNaN(event.currentTarget.valueAsNumber)) {
      value = min;
      return;
    }
    valid =
      event.currentTarget.valueAsNumber >= min &&
      event.currentTarget.valueAsNumber <= max;
  };

  const getOutputXPos = ({ value, min, max }) => {
    // calculates the value as a percentage to position the output text
    return ((value - min) * 100) / (max - min);
  };

  const getOutputXPosOffset = ({ outputElement, outputXPos }) => {
    // as the output text moves to the right with the slider thumb, it needs to shift left slightly
    // such that it doesn't overflow the width of the slider track.
    const offset = outputElement?.clientWidth ?? 15;
    return Math.floor((outputXPos * offset) / 100);
  };

  const handleWindowResize = () => {
    outputXPos = getOutputXPos({ value, min, max });
    outputXPosOffset = getOutputXPosOffset({ outputElement, outputXPos });
  };
</script>

<svelte:window on:resize={handleWindowResize} />
<div class="w-full px-1 py-4 {$$props.class}">
  <div class="range-input-container">
    <div class="relative w-auto grow">
      <span class="absolute -bottom-6 left-0 text-xs font-normal">
        {min}
      </span>
      <div class="relative flex items-center">
        <output
          bind:this={outputElement}
          class:hidden={!valid}
          class="absolute -top-6 text-center text-xs font-normal"
          style="left: calc({outputXPos}% - ({outputXPosOffset}px));"
          for="range">{value ?? ''}</output
        >
        <input
          id="{id}-range"
          name="range"
          type="range"
          class="h-0 w-full cursor-pointer appearance-none rounded border-y border-primary"
          bind:value
          on:input={handleInput}
          {min}
          {max}
          {step}
          {...omit($$restProps, 'class')}
        />
        <Label hidden {label} for="{id}-range" />
      </div>
      <span class="absolute -bottom-6 right-0 text-xs font-normal">
        {max}
      </span>
    </div>
    <div class="flex shrink">
      <input
        {id}
        class="numeric-input"
        class:invalid={!valid}
        type="number"
        inputmode="numeric"
        bind:value
        on:input={handleInput}
        {min}
        {max}
        step={$$props.step}
      />
    </div>
    <Label hidden={labelHidden} class="shrink" {label} for={id} />
  </div>
</div>

<style lang="postcss">
  .range-input-container {
    @apply inline-flex w-full flex-row items-center gap-4 whitespace-nowrap text-primary;
  }

  .numeric-input {
    @apply h-10 w-10 rounded-lg border border-subtle bg-information text-center text-sm focus-within:outline-none focus-within:ring-4 focus-within:ring-primary/70;

    appearance: textfield;
  }

  .numeric-input::-webkit-outer-spin-button,
  .numeric-input::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }

  .numeric-input.invalid {
    @apply border-danger bg-red-100 text-danger;
  }

  .numeric-input:focus {
    @apply outline outline-2 outline-blue-700;
  }

  .floating-value {
    @apply absolute -top-2;
  }

  input[type='range']::-webkit-slider-thumb {
    @apply h-4 w-8 appearance-none rounded-full border border-solid border-primary bg-information;
  }

  input[type='range']::-moz-range-thumb {
    @apply h-4 w-8 rounded-full border border-solid border-primary bg-gradient-to-br from-blue-100 to-purple-100 shadow-none;
  }

  input[type='range']:focus {
    @apply outline-none;
  }

  input[type='range']:focus::-webkit-slider-thumb {
    @apply border border-primary outline outline-2 outline-blue-700;
  }

  input[type='range']:focus::-moz-range-thumb {
    @apply border border-primary outline outline-2 outline-blue-700;
  }
</style>
