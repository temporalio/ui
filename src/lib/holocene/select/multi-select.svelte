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

  import type { ButtonStyles } from '../button.svelte';
  import type { IconName } from '../icon';
  import Icon from '../icon/icon.svelte';

  type Option = { label: string; value: string; icon?: IconName };
  type MultiSelectOptions = Option[];

  export let options: MultiSelectOptions = [];
  export let initialSelected: MultiSelectOptions = [];
  export let onChange: (options: MultiSelectOptions) => void;
  export let label: string;
  export let id: string;
  export let variant: ButtonStyles['variant'] = 'secondary';
  export let icon: IconName | undefined = undefined;
  export let selectAllLabel: string;
  export let clearAllLabel: string;
  export let active = false;
  export let disabled = false;
  export let position: 'left' | 'right' = 'left';
  export let initialSelectedAll = true;

  let selectedOptions = initialSelected.length
    ? initialSelected
    : initialSelectedAll
      ? options
      : [];

  const open = writable(false);

  const onOptionClick = (option: Option) => {
    if (selectedOptions.some((s) => s.value === option.value)) {
      selectedOptions = selectedOptions.filter((s) => s.value !== option.value);
    } else {
      selectedOptions = [...selectedOptions, option];
    }

    onChange(selectedOptions);
  };

  const onSelectAllOptionClick = () => {
    selectedOptions = options;
    onChange(selectedOptions);
  };

  const onRemoveAllOptionClick = () => {
    selectedOptions = [];
    onChange(selectedOptions);
  };
</script>

<MenuContainer {open}>
  <MenuButton
    hasIndicator
    controls={id}
    {variant}
    {active}
    {disabled}
    data-track-name="multi-select"
    data-track-intent="select"
    data-track-text={label}
  >
    {#if icon}<Icon class="md:hidden" name={icon} />{/if}
    <span class="max-md:hidden">{label}</span>
  </MenuButton>
  <Menu {id} keepOpen {position}>
    {#each options as option (option)}
      {@const checked = Boolean(
        selectedOptions.find((s) => s.value === option.value),
      )}
      <MenuItem
        data-testid={option.label}
        onclick={() => {
          onOptionClick(option);
        }}
      >
        {#snippet leading()}
          <Checkbox
            on:click={() => onOptionClick(option)}
            {checked}
            label={option.label}
            labelHidden
          />
        {/snippet}
        <div class="flex items-center gap-2">
          {#if option.icon}
            <Icon slot="trailing" name={option.icon} />
          {/if}
          {option.label}
        </div>
      </MenuItem>
    {/each}
    <MenuDivider />
    <MenuItem
      data-testid="multiselect-select-all"
      onclick={onSelectAllOptionClick}
    >
      {selectAllLabel}
    </MenuItem>
    <MenuItem
      data-testid="multiselect-remove-all"
      onclick={onRemoveAllOptionClick}
    >
      {clearAllLabel}
    </MenuItem>
  </Menu>
</MenuContainer>
