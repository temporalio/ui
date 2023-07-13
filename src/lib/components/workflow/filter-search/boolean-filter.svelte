<script lang="ts">
  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';

  import Menu from '$lib/holocene/primitives/menu/menu.svelte';
  import MenuButton from '$lib/holocene/primitives/menu/menu-button.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import MenuContainer from '$lib/holocene/primitives/menu/menu-container.svelte';

  type T = $$Generic;

  const { filter, handleSubmit } = getContext<FilterContext<T>>(FILTER_CONTEXT);
  const options = [
    { value: 'true', label: 'True' },
    { value: 'false', label: 'False' },
  ];

  $: selectedOption =
    options.find((o) => o.value === $filter.value) ?? options[0];
  $: selectedLabel = selectedOption?.label;
</script>

<MenuContainer>
  <MenuButton
    id="boolean-filter"
    controls="boolean-filter-menu"
    class="border-l-0 rounded-r border border-gray-800 bg-white text-gray-800 hover:border-primary hover:bg-primary hover:text-white h-10 p-2"
  >
    {selectedLabel}
  </MenuButton>
  <Menu class="max-h-80 overflow-y-scroll w-fit" id="boolean-filter-menu">
    {#each options as { value, label }}
      <MenuItem
        on:click={() => {
          $filter.value = value;
          handleSubmit();
        }}
      >
        {label}
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
