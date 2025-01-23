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

  import type { IconName } from '../icon';
  import Icon from '../icon/icon.svelte';
  import type { MenuButtonVariant } from '../menu/menu-button.svelte';

  type Option = { label: string; value: string; icon?: IconName };
  type MultiSelectOptions = Option[];

  interface Props {
    options?: MultiSelectOptions;
    initialSelected?: MultiSelectOptions;
    onChange: (options: MultiSelectOptions) => void;
    label: string;
    id: string;
    variant?: MenuButtonVariant;
    icon?: IconName;
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
    icon,
    selectAllLabel,
    clearAllLabel,
    active = false,
    disabled = false,
    position = 'left',
    initialSelectedAll = true,
  }: Props = $props();

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
  <MenuButton hasIndicator controls={id} {variant} {active} {disabled}>
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
            onclick={() => onOptionClick(option)}
            {checked}
            label={option.label}
            labelHidden
          />
        {/snippet}
        <div class="flex items-center gap-2">
          {#if option.icon}
            <Icon name={option.icon} />
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
