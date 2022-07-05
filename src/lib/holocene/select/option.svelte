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
  import Icon from '$holocene/icon/index.svelte';
  import MenuItem from '$holocene/primatives/menu/menu-item.svelte';

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

<MenuItem on:click={handleOptionClick} class="p-4 hover:bg-gray-50" {dark}>
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
</MenuItem>

<style lang="postcss">
  .option-label {
    @apply flex font-poppins font-medium;
  }

  .option-description {
    @apply flex font-inter font-normal;
  }
</style>
