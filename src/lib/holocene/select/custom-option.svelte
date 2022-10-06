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
  import MenuItem from '$holocene/primitives/menu/menu-item.svelte';
  import type { Writable } from 'svelte/store';
  import type { SelectContext } from './select.svelte';

  const context = getContext<Writable<SelectContext<T>>>('select-value');

  type T = $$Generic;

  export let value: T | undefined = undefined;
  export let dark: boolean = false;

  let selected: boolean;

  const handleOptionClick = () => {
    context.update((previous) => ({ ...previous, selectValue: value }));
    $context.onChange(value);
  };
</script>

<MenuItem
  class="flex flex-row items-start"
  on:click={handleOptionClick}
  {selected}
  {dark}
>
  <div class={$$props.class}>
    <slot />
  </div>
</MenuItem>
