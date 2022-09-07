<script>import Menu from './primitives/menu/menu.svelte';
import MenuItem from './primitives/menu/menu-item.svelte';
import { clickOutside } from './outside-click';
import Input from './input/input.svelte';
import { noop } from 'svelte/internal';
export let id;
export let value;
export let label = '';
export let placeholder = '';
export let icon = null;
export let copyable = false;
export let theme = 'light';
export let options;
export let onOptionClick;
export let disabled = false;
let show = false;
$: filteredOptions = !value
    ? options
    : options.filter((option) => option.toLowerCase().includes(value.toLowerCase()));
</script>

<div class="relative" use:clickOutside on:click-outside={() => (show = false)}>
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
