<script lang="ts">
  import { getContext } from 'svelte';

  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { isNullConditional } from '$lib/utilities/is';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, handleSubmit } = getContext<FilterContext>(FILTER_CONTEXT);
  const options = [
    { value: 'true', label: translate('common.true') },
    { value: 'false', label: translate('common.false') },
    { value: 'is', label: translate('common.is-null') },
    { value: 'is not', label: translate('common.is-not-null') },
  ];

  $: selectedOption =
    options.find(
      (o) => o.value === $filter.value || o.value === $filter.conditional,
    ) ?? options[0];
  $: selectedLabel = selectedOption?.label;
</script>

<MenuContainer>
  <MenuButton
    class="border-l-0!"
    id="boolean-filter"
    controls="boolean-filter-menu"
  >
    {selectedLabel}
  </MenuButton>
  <Menu id="boolean-filter-menu">
    {#each options as { value, label }}
      <MenuItem
        on:click={() => {
          if (isNullConditional(value)) {
            $filter.conditional = value;
            $filter.value = null;
          } else {
            $filter.conditional = '=';
            $filter.value = value;
          }
          handleSubmit();
        }}
        class="text-nowrap"
      >
        {label}
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
