<script lang="ts" context="module">
  export interface Option<T> {
    label: string;
    value: T;
    description?: string;
  }

  export const EMPTY_OPTION: Option<any> = {
    label: '',
    value: '',
  };

  export const isOption = (x: unknown): x is Option<unknown> => {
    return x.hasOwnProperty('label') && x.hasOwnProperty('value');
  };
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/holocene/icon/index.svelte';

  type T = $$Generic;
  export let label: Option<T>['label'];
  export let value: Option<T>['value'];
  export let description: Option<T>['description'] = '';
  export let selected: boolean;
  export let dark: boolean = false;

  const dispatch = createEventDispatcher();

  function handleOptionClick() {
    dispatch('click', { option: { label, value, description } });
  }
</script>

<div on:click={handleOptionClick} class="option" class:dark {value}>
  <div class="w-6 mr-2">
    {#if selected}
      <Icon stroke="currentcolor" name="checkMark" scale={0.9} />
    {/if}
  </div>
  <div class="flex flex-col w-full">
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
    @apply rounded-sm w-full flex flex-row p-4 cursor-pointer bg-white text-gray-900 hover:bg-gray-50;
  }

  .option-label {
    @apply flex font-medium font-poppins;
  }

  .option-description {
    @apply flex font-normal font-inter;
  }

  .option.dark {
    @apply bg-gray-900 text-white hover:bg-gray-800;
  }
</style>
