<script lang="ts">
  import { omit } from '$lib/utilities/omit';
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface $$Props extends HTMLInputAttributes {
    value: number;
    id: string;
    label?: string;
    min?: number;
    max?: number;
    'data-testid'?: string;
  }

  export let label: string = undefined;
  export let min: number = undefined;
  export let max: number = undefined;
  export let id: string = undefined;
  export let value: number = Math.round((min + max) / 2);
  let valid: boolean = true;
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
          name="range"
          type="range"
          class="h-0 w-full cursor-pointer appearance-none rounded border-y-2 border-primary"
          bind:value
          on:input={handleInput}
          {min}
          {max}
          step={$$props.step}
          {...omit($$restProps, 'class')}
        />
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
    {#if label}
      <label class="flex shrink text-sm" for={id}>
        {label}
      </label>
    {/if}
  </div>
</div>

<style lang="postcss">
  .range-input-container {
    @apply inline-flex w-full flex-row items-center gap-4 whitespace-nowrap;
  }

  .numeric-input {
    @apply h-10 w-10 rounded border border-primary text-center text-sm;

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
    @apply h-4 w-8 appearance-none rounded-full border border-solid border-primary bg-gradient-to-br from-blue-100 to-purple-100;
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
