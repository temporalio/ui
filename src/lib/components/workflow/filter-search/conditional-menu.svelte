<script lang="ts">
  import { getContext } from 'svelte';

  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, focusedElementId } =
    getContext<FilterContext>(FILTER_CONTEXT);
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
  export let noBorderLeft = false;
  export let noBorderRight = false;

  $: filterConditionalOption = options.find(
    (o) => o.value === $filter.conditional,
  );
  $: options, updateFilterConditional();
  $: selectedOption = filterConditionalOption ?? options[0];
  $: selectedLabel = selectedOption?.label ?? selectedOption?.value;

  function updateFilterConditional() {
    if (!filterConditionalOption) {
      $filter.conditional = options[0].value;
    }
  }
</script>

<MenuContainer>
  <MenuButton
    unround
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
