<script lang="ts" context="module">
  export interface Option {
    label: string;
    value: string | boolean | number;
    description?: string;
  }

  export const EMPTY_OPTION: Option = {
    label: '',
    value: '',
  };

  export const isOption = (x: unknown): x is Option => {
    return x.hasOwnProperty('label') && x.hasOwnProperty('value');
  };
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/holocene/icon/index.svelte';

  type T = $$Generic;

  export let value: T;
  export let selected: boolean;
  export let dark: boolean = false;

  const dispatch = createEventDispatcher<{ select: { value: T } }>();

  function handleOptionClick() {
    dispatch('select', { value });
  }

  let label: string | T;
  let description: string | undefined;

  if (isOption(value)) {
    ({ label, description } = value);
  } else {
    label = value;
  }
</script>

<div on:click={handleOptionClick} class="option" class:dark>
  <div class="mr-2 w-6">
    {#if selected}
      <Icon stroke="currentcolor" name="checkMark" scale={0.9} />
    {/if}
  </div>
  <div class="flex w-full flex-col">
    <span class="option-label">{label}</span>
    {#if description}
      <span class="option-description">
        {description}
      </span>
    {/if}
  </div>
</div>

<style lang="postcss">
  .option {
    @apply flex w-full cursor-pointer flex-row rounded-sm bg-white p-4 text-gray-900 hover:bg-gray-50;
  }

  .option-label {
    @apply flex font-poppins font-medium;
  }

  .option-description {
    @apply flex font-inter font-normal;
  }

  .option.dark {
    @apply bg-gray-900 text-white hover:bg-gray-800;
  }
</style>
