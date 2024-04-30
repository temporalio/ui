<script lang="ts">
  import { getContext } from 'svelte';

  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);
  const options = [
    { value: 'true', label: translate('common.true') },
    { value: 'false', label: translate('common.false') },
  ];

  $: selectedOption =
    options.find((o) => o.value === $filter.value) ?? options[0];
  $: selectedLabel = selectedOption?.label;
</script>

<MenuContainer>
  <MenuButton
    class="!border-l-0"
    id="boolean-filter"
    controls="boolean-filter-menu"
  >
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
