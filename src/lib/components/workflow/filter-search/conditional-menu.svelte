<script lang="ts">
  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';

  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';

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
    id="conditional-menu-button"
    controls="conditional-menu"
    class="border-l-0 border-r-0 border border-gray-800 bg-white text-gray-800 hover:border-primary hover:bg-primary hover:text-white h-10 p-2"
    {disabled}
  >
    {selectedLabel}
  </MenuButton>
  <Menu class="max-h-80 overflow-y-scroll w-fit" id="conditional-menu">
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
