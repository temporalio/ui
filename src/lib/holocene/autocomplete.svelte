<script lang="ts">
  import { clickOutside } from '$lib/holocene/outside-click';
  import { noop } from 'svelte/internal';
  import Input from '$lib/holocene/input/input.svelte';
  import Menu from './primitives/menu/menu.svelte';
  import MenuItem from './primitives/menu/menu-item.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { IconName } from '$lib/holocene/icon/paths';

  interface $$Props extends HTMLInputAttributes {
    id: string;
    value: string;
    label?: string;
    icon?: IconName;
    copyable?: boolean;
    clearable?: boolean;
    theme?: 'dark' | 'light';
    options: string[];
    onOptionClick: (option: string) => void;
  }

  export let id: string;
  export let value: string;
  export let label = '';
  export let placeholder = '';
  export let icon: IconName = null;
  export let copyable: boolean = false;
  export let theme: 'dark' | 'light' = 'light';
  export let options: string[];
  export let onOptionClick: (option: string) => void;
  export let disabled = false;

  let className = '';
  export { className as class };

  let show = false;
  $: filteredOptions = !value
    ? options
    : options.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase()),
      );
</script>

<div
  class="relative {className}"
  use:clickOutside
  on:click-outside={() => (show = false)}
>
  <Input
    {id}
    bind:value
    {icon}
    {label}
    {placeholder}
    {theme}
    {copyable}
    {disabled}
    on:input
    on:change
    on:focus={() => (show = true)}
    {...$$restProps}
  />
  {#if show}
    <Menu class="h-auto max-h-80" {show} id="{id}-menu">
      {#each filteredOptions as option}
        <MenuItem
          on:click={() => {
            onOptionClick(option);
            show = false;
          }}
        >
          {option}
        </MenuItem>
      {:else}
        <MenuItem on:click={noop}>No Results</MenuItem>
      {/each}
    </Menu>
  {/if}
</div>
