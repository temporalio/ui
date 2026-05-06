<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { isNullConditional } from '$lib/utilities/is';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const defaultConditionOptions = [
    { value: '>' },
    { value: '>=' },
    { value: '=' },
    { value: '!=' },
    { value: '<=' },
    { value: '<' },
  ];

  type Props = {
    options?: { value: string; label?: string }[];
    disabled?: boolean;
    inputId: string;
    noBorderLeft?: boolean;
    noBorderRight?: boolean;
    children?: Snippet;
  };

  let {
    options = defaultConditionOptions,
    disabled = false,
    inputId,
    noBorderLeft = false,
    noBorderRight = false,
    children,
  }: Props = $props();

  const { filter, focusedElementId, handleSubmit } =
    getContext<FilterContext>(FILTER_CONTEXT);

  const conditionalOptions = $derived([
    ...options,
    { value: 'is', label: translate('common.is-null') },
    { value: 'is not', label: translate('common.is-not-null') },
  ]);

  const filterConditionalOption = $derived(
    conditionalOptions.find((o) => o.value === $filter.conditional),
  );
  const isNullFilter = $derived(isNullConditional($filter.conditional));
  const selectedOption = $derived(
    filterConditionalOption ?? conditionalOptions[0],
  );
  const selectedLabel = $derived(
    selectedOption?.label ?? selectedOption?.value,
  );

  $effect(() => {
    if (!filterConditionalOption) {
      $filter.conditional = conditionalOptions[0].value;
    }
  });

  function handleNullFilter() {
    $filter.value = null;
    $filter.customDate = false;
    handleSubmit();
  }
</script>

<MenuContainer>
  <MenuButton
    class="{noBorderRight && !isNullFilter ? '!border-r-0' : ''} {noBorderLeft
      ? '!border-l-0'
      : ''} whitespace-nowrap"
    id="conditional-menu-button"
    controls="conditional-menu"
    {disabled}
  >
    {selectedLabel}
  </MenuButton>
  <Menu id="conditional-menu" class="whitespace-nowrap">
    {#each conditionalOptions as { value, label } (value)}
      <MenuItem
        onclick={() => {
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
  {@render children?.()}
{/if}
