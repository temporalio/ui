<script lang="ts">
  import { writable } from 'svelte/store';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuDivider,
    MenuItem,
  } from '$lib/holocene/menu';

  import Icon from '../icon/icon.svelte';
  import type { IconName } from '../icon/paths';
  import type { MenuButtonVariant } from '../menu/menu-button.svelte';

  type Option = { label: string; value: string };
  type MultiSelectOptions = Option[];

  export let options: MultiSelectOptions = [];
  export let initialSelected: MultiSelectOptions = [];
  export let onChange: (options: MultiSelectOptions) => void;
  export let label: string;
  export let id: string;
  export let variant: MenuButtonVariant = 'secondary';
  export let icon: IconName | undefined = undefined;
  export let selectAllLabel: string;
  export let clearAllLabel: string;

  let selectedOptions = initialSelected.length ? initialSelected : options;

  const open = writable(false);

  const resetFilter = () => {};

  const onOptionClick = (option: Option) => {
    if (selectedOptions.find((s) => s.value === option.value)) {
      selectedOptions = selectedOptions.filter((s) => s.value !== option.value);
    } else {
      selectedOptions = [...selectedOptions, option];
    }
    onChange(selectedOptions);
  };

  const onSelectAllOptionClick = () => {
    selectedOptions = options;
    onChange([]);
  };

  const onRemoveAllOptionClick = () => {
    selectedOptions = [];
    onChange([]);
  };
</script>

<MenuContainer {open} on:close={resetFilter}>
  <MenuButton
    hasIndicator
    controls={id}
    {variant}
    on:click={() => {
      if ($open) resetFilter();
    }}
  >
    {#if icon}<Icon class="md:hidden" name={icon} />{/if}
    <span class="max-md:hidden">{label}</span>
  </MenuButton>
  <Menu {id} keepOpen>
    {#each options as option (option)}
      {@const checked = Boolean(
        selectedOptions.find((s) => s.value === option.value),
      )}
      <MenuItem
        data-testid={option.label}
        on:click={() => {
          onOptionClick(option);
        }}
      >
        <Checkbox
          on:click={() => onOptionClick(option)}
          slot="leading"
          {checked}
          label={option.label}
          labelHidden
        />
        {option.label}
      </MenuItem>
    {/each}
    <MenuDivider />
    <MenuItem
      data-testid="multiselect-select-all"
      on:click={onSelectAllOptionClick}
    >
      {selectAllLabel}
    </MenuItem>
    <MenuItem
      data-testid="multiselect-remove-all"
      on:click={onRemoveAllOptionClick}
    >
      {clearAllLabel}
    </MenuItem>
  </Menu>
</MenuContainer>
