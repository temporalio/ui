<script lang="ts">
  import { getContext } from 'svelte';
  
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  
  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';
  

  type T = $$Generic;

  const { filter, focusedElementId } =
    getContext<FilterContext<T>>(FILTER_CONTEXT);
  const defaultConditionOptions = [
    { value: '>' },
    { value: '>=' },
    { value: '=' },
    { value: '<=' },
    { value: '<' },
  ];

  export let options: { value: string; label?: string }[] =
    defaultConditionOptions;
  export let disabled = false;
  export let inputId: string;

  $: options, ($filter.conditional = options[0].value);

  $: selectedOption =
    options.find((o) => o.value === $filter.conditional) ?? options[0];
  $: selectedLabel = selectedOption?.label ?? selectedOption?.value;
</script>

<MenuContainer>
  <MenuButton
    unround
    class="!border-l-0 !border-r-0"
    id="conditional-menu-button"
    controls="conditional-menu"
    {disabled}
  >
    {selectedLabel}
  </MenuButton>
  <Menu id="conditional-menu">
    {#each options as { value, label }}
      <MenuItem
        on:click={() => {
          $filter.conditional = value;
          $focusedElementId = inputId;
        }}
      >
        {label ?? value}
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
