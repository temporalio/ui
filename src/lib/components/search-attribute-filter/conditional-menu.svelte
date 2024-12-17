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

  const { filter, focusedElementId, handleSubmit } =
    getContext<FilterContext>(FILTER_CONTEXT);
  const defaultConditionOptions = [
    { value: '>' },
    { value: '>=' },
    { value: '=' },
    { value: '!=' },
    { value: '<=' },
    { value: '<' },
  ];

  export let options: { value: string; label?: string }[] =
    defaultConditionOptions;
  export let disabled = false;
  export let inputId: string;
  export let noBorderLeft = false;
  export let noBorderRight = false;

  let conditionalOptions = [
    ...options,
    { value: 'is', label: translate('common.is-null') },
    { value: 'is not', label: translate('common.is-not-null') },
  ];

  $: filterConditionalOption = conditionalOptions.find(
    (o) => o.value === $filter.conditional,
  );
  $: filterConditionalOption, updateFilterConditional();
  $: isNullFilter = isNullConditional($filter.conditional);
  $: selectedOption = filterConditionalOption ?? conditionalOptions[0];
  $: selectedLabel = selectedOption?.label ?? selectedOption?.value;

  function handleNullFilter() {
    $filter.value = null;
    handleSubmit();
  }

  function updateFilterConditional() {
    if (!filterConditionalOption)
      $filter.conditional = conditionalOptions[0].value;
  }
</script>

<MenuContainer>
  <MenuButton
    class="{noBorderRight ? '!border-r-0' : ''} {noBorderLeft
      ? '!border-l-0'
      : ''} whitespace-nowrap"
    id="conditional-menu-button"
    controls="conditional-menu"
    {disabled}
  >
    {selectedLabel}
  </MenuButton>
  <Menu id="conditional-menu" class="whitespace-nowrap">
    {#each conditionalOptions as { value, label }}
      <MenuItem
        on:click={() => {
          $filter.conditional = value;
          $focusedElementId = inputId;
          if (isNullConditional(value)) handleNullFilter();
        }}
      >
        {label ?? value}
      </MenuItem>
    {/each}
  </Menu>
</MenuContainer>
{#if !isNullFilter}
  <slot />
{/if}
