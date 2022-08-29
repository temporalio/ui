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
</script>

<script lang="ts">
  import { getContext } from 'svelte';
  import Icon from '$holocene/icon/index.svelte';
  import MenuItem from '$holocene/primitives/menu/menu-item.svelte';
  import type { Writable } from 'svelte/store';
  import type { SelectContext } from './select.svelte';

  const context = getContext<Writable<SelectContext<T>>>('select-value');

  type T = $$Generic;

  export let value: T | undefined = undefined;
  export let description: string = '';
  export let dark: boolean = false;

  let selected: boolean;
  let _value: any;
  let slotWrapper: HTMLSpanElement;

  $: {
    if (slotWrapper) {
      _value = value ?? slotWrapper.textContent;
      selected = $context.selectValue === _value;
    }
  }

  const handleOptionClick = () => {
    context.update((previous) => ({ ...previous, selectValue: _value }));
    $context.onChange(_value);
  };
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
    <span bind:this={slotWrapper} class="option-label">
      <slot />
    </span>
    {#if description}
      <span class="option-description">
        {description}
      </span>
    {/if}
  </div>
</MenuItem>

<style lang="postcss">
  .option-label {
    @apply flex whitespace-nowrap font-secondary text-sm font-medium;
  }

  .option-description {
    @apply flex font-primary text-sm font-normal;
  }
</style>
