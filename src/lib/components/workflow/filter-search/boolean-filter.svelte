<script lang="ts">
  import { getContext } from 'svelte';
  import { type FilterContext, FILTER_CONTEXT } from './index.svelte';
  import { translate } from '$lib/i18n/translate';

  import {
    MenuContainer,
    MenuButton,
    Menu,
    MenuItem,
  } from '$lib/holocene/menu';

  type T = $$Generic;

  const { filter, handleSubmit } = getContext<FilterContext<T>>(FILTER_CONTEXT);
  const options = [
    { value: 'true', label: translate('true') },
    { value: 'false', label: translate('false') },
  ];

  $: selectedOption =
    options.find((o) => o.value === $filter.value) ?? options[0];
  $: selectedLabel = selectedOption?.label;
</script>

<MenuContainer>
  <MenuButton id="boolean-filter" controls="boolean-filter-menu">
    {selectedLabel}
  </MenuButton>
  <Menu id="boolean-filter-menu">
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
