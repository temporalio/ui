<script lang="ts" context="module">
  export interface OptionType<T> {
    label: string;
    value: T;
    description?: string;
  }

  export const EMPTY_OPTION: OptionType<string> = {
    label: '',
    value: '',
  };

  export const isOption = (x: unknown): x is OptionType<unknown> => {
    return x.hasOwnProperty('label') && x.hasOwnProperty('value');
  };
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from '$holocene/icon/index.svelte';
  import MenuItem from '$holocene/primitives/menu/menu-item.svelte';

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

<MenuItem
  class="flex flex-row items-start"
  on:click={handleOptionClick}
  {selected}
  {dark}
>
  <div class="mr-2 w-6">
    {#if selected}
      <Icon stroke="currentcolor" name="checkMark" scale={0.8} />
    {/if}
  </div>
  <div class="flex w-full flex-col">
    {#if $$slots.default}
      <slot />
    {:else}
      <span class="option-label">{label}</span>
    {/if}
    {#if description}
      <span class="option-description">
        {description}
      </span>
    {/if}
  </div>
</MenuItem>

<style lang="postcss">
  .option-label {
    @apply flex font-secondary text-sm font-medium;
  }

  .option-description {
    @apply flex font-primary text-sm font-normal;
  }
</style>
