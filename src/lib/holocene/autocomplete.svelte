<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { noop } from 'svelte/internal';
  
  import type { IconName } from '$lib/holocene/icon/paths';
  import Input from '$lib/holocene/input/input.svelte';
  
  import MenuContainer from './primitives/menu/menu-container.svelte';
  import MenuItem from './primitives/menu/menu-item.svelte';
  import Menu from './primitives/menu/menu.svelte';

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
  export let copyable = false;
  export let theme: 'dark' | 'light' = 'light';
  export let options: string[];
  export let onOptionClick: (option: string) => void;
  export let disabled = false;

  let className = '';
  export { className as class };

  $: filteredOptions = !value
    ? options
    : options.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase()),
      );
</script>

<MenuContainer class={className} let:open>
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
    on:focus={() => open.set(true)}
    {...$$restProps}
  />
  <Menu class="max-h-80 overflow-y-scroll" id="{id}-menu">
    {#each filteredOptions as option}
      <MenuItem
        on:click={() => {
          onOptionClick(option);
          open.set(false);
        }}
      >
        {option}
      </MenuItem>
    {:else}
      <MenuItem on:click={noop}>No Results</MenuItem>
    {/each}
  </Menu>
</MenuContainer>
