<script module lang="ts">
  import type { IconComponent } from '$lib/io/icon';

  type Option = { label: string; value: string; Icon?: IconComponent };
  export type MultiSelectOptions = Option[];
</script>

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

  interface Props {
    options?: MultiSelectOptions;
    initialSelected?: MultiSelectOptions;
    onChange: (options: MultiSelectOptions) => void;
    label: string;
    id: string;
    variant?: ButtonStyles['variant'];
    Icon?: IconComponent;
    selectAllLabel: string;
    clearAllLabel: string;
    active?: boolean;
    disabled?: boolean;
    position?: 'left' | 'right';
    initialSelectedAll?: boolean;
  }

  let {
    options = [],
    initialSelected = [],
    onChange,
    label,
    id,
    variant = 'secondary',
    Icon,
    selectAllLabel,
    clearAllLabel,
    active = false,
    disabled = false,
    position = 'left',
    initialSelectedAll = true,
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let selectedOptions = $state(
    initialSelected.length
      ? initialSelected
      : initialSelectedAll
        ? options
        : [],
  );

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
    {#if Icon}<Icon class="md:hidden" />{/if}
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
            onclick={() => onOptionClick(option)}
            {checked}
            label={option.label}
            labelHidden
          />
        {/snippet}
        <div class="flex items-center gap-2">
          {#if option.Icon}
            {@const OptionIcon = option.Icon}
            <OptionIcon />
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
