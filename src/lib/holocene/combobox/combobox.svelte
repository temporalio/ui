<script module lang="ts">
  import { cva, type VariantProps } from 'class-variance-authority';

  const comboboxStyles = cva(
    [
      'surface-primary',
      'flex',
      'max-h-28',
      'min-h-10',
      'w-full',
      'flex-row',
      'items-center',
      'overflow-auto',
      'border',
      'text-sm',
      'dark:focus-within:surface-primary',
      'focus-within:outline-none',
      'focus-within:ring-2',
    ],
    {
      variants: {
        variant: {
          default:
            'border-subtle focus-within:border-interactive focus-within:ring-primary/70',
          ghost:
            'bg-transparent border-transparent focus-within:border-transparent focus-within:ring-transparent focus-within:bg-transparent hover:surface-interactive-secondary',
        },
      },
      defaultVariants: {
        variant: 'default',
      },
    },
  );

  export type ComboboxStyles = VariantProps<typeof comboboxStyles>;
</script>

<script lang="ts">
  import type {
    FocusEventHandler,
    FormEventHandler,
    HTMLInputAttributes,
    KeyboardEventHandler,
    MouseEventHandler,
  } from 'svelte/elements';
  import { writable, type Writable } from 'svelte/store';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import ComboboxOption from '$lib/holocene/combobox/combobox-option.svelte';
  import Label from '$lib/holocene/label.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';

  import Badge from '../badge.svelte';
  import Button from '../button.svelte';
  import Chip from '../chip.svelte';
  import type { IconName } from '../icon';
  import Icon from '../icon/icon.svelte';
  import MenuDivider from '../menu/menu-divider.svelte';
  import Tooltip from '../tooltip.svelte';

  type T = $$Generic;

  interface BaseProps extends Omit<
    HTMLInputAttributes,
    'onchange' | 'oninput' | 'onclose'
  > {
    id: string;
    label: string;
    noResultsText: string;
    disabled?: boolean;
    labelHidden?: boolean;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    leadingIcon?: IconName;
    showChevron?: boolean;
    minSize?: number;
    maxSize?: number;
    'data-testid'?: string;
    error?: string;
    valid?: boolean;
    actionTooltip?: string;
    href?: string;
    hrefDisabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    open?: Writable<boolean>;
    maxMenuHeight?: string;
    variant?: ComboboxStyles['variant'];
    class?: string;
    optionClass?: string;
    action?: Snippet;
    onchange?: (value: string | T) => void;
    onclose?: (selected: string | T) => void;
    oninput?: (value: string) => void;
  }

  interface MultiSelectProps {
    multiselect: true;
    value: string[];
    displayChips?: boolean;
    chipLimit?: number;
    removeChipLabel?: string;
    selectAllLabel?: string;
    deselectAllLabel?: string;
    numberOfItemsSelectedLabel?: (count: number) => string;
  }

  interface SingleSelectProps {
    multiselect?: false;
    value: string;
    chipLimit?: never;
    displayChips?: never;
    removeChipLabel?: never;
    selectAllLabel?: never;
    deselectAllLabel?: never;
    numberOfItemsSelectedLabel?: never;
  }

  interface StringOptionProps {
    options: string[];
    optionValueKey?: never;
    optionLabelKey?: never;
  }

  interface CustomOptionProps {
    options: T[];
    optionValueKey: keyof T;
    optionLabelKey?: keyof T;
  }

  type Props =
    | (BaseProps & StringOptionProps & SingleSelectProps)
    | (BaseProps & StringOptionProps & MultiSelectProps)
    | (BaseProps & CustomOptionProps & SingleSelectProps)
    | (BaseProps & CustomOptionProps & MultiSelectProps);

  let {
    class: className,
    id,
    label,
    multiselect = false,
    value = $bindable(),
    noResultsText,
    disabled = false,
    labelHidden = false,
    options,
    placeholder = null,
    readonly = false,
    required = false,
    leadingIcon = null,
    showChevron = false,
    optionValueKey = null,
    optionLabelKey = optionValueKey,
    minSize = 0,
    maxSize = 120,
    error = '',
    valid = true,
    open = writable(false),
    maxMenuHeight = 'max-h-[20rem]',
    action,
    chipLimit = 5,
    displayChips = true,
    selectAllLabel = 'Select All',
    deselectAllLabel = 'Deselect All',
    removeChipLabel = 'Remove Option',
    numberOfItemsSelectedLabel = (count: number) =>
      `${count} option${count > 1 ? 's' : ''} selected`,
    actionTooltip = '',
    href = '',
    hrefDisabled = false,
    loading = false,
    loadingText = 'Loading more results',
    variant = 'default',
    optionClass = '',
    onchange,
    onclose,
    oninput,
    'data-testid': testId = id,
    ...rest
  }: Props = $props();

  // Filter value and display value are close but different in a few cases
  // primary difference is when opening a select box display value is filled
  // and filter value should be blank
  let filterValue: string = $state('');
  let menuElement: HTMLUListElement | null = $state(null);
  let inputElement: HTMLInputElement | null = $state(null);

  const selectedOption = $derived(getSelectedOption(options));
  let list = $derived(filterOptions(filterValue, options));
  let displayValue = $derived(
    !multiselect ? getDisplayValue(selectedOption) : undefined,
  );

  // We need this piece of code to focus the element when externally modifying the
  // open store. Specifically we use this behaviour in bottom nav to focus the combobox
  // after the bottom nav is clicked
  $effect(() => {
    if ($open && inputElement && document.activeElement !== inputElement) {
      inputElement.focus();
      inputElement.select();
    }
  });

  $effect(() => {
    if (inputElement && displayValue) {
      if (displayValue.length < minSize) {
        inputElement.size = minSize;
      } else if (displayValue.length > maxSize) {
        inputElement.size = maxSize;
      } else {
        inputElement.size = displayValue.length;
      }
    }
  });

  const openList = () => {
    if ($open) return;
    $open = true;
    filterValue = '';
    inputElement.focus();
    inputElement.select();
  };

  const closeList = () => {
    if (!$open) return;
    $open = false;
    onclose?.(selectedOption);
    resetValueAndOptions();
  };

  const handleMenuClose = () => {
    onclose?.(selectedOption);
    resetValueAndOptions();
  };

  const resetValueAndOptions = () => {
    displayValue = getDisplayValue(selectedOption);
    list = options;
  };

  const isArrayValue = (value: string | string[]): value is string[] => {
    return Array.isArray(value);
  };

  const isStringOption = (option: string | T): option is string => {
    return typeof option === 'string';
  };

  const isObjectOption = (option: string | T): option is T & object => {
    return typeof option === 'object';
  };

  const canRenderCustomOption = (option: T) => {
    if (option === null) return false;
    if (typeof option !== 'object') return false;

    return (
      optionValueKey !== null &&
      optionLabelKey !== null &&
      optionValueKey in option &&
      optionLabelKey in option
    );
  };

  function getDisplayValue(option: string | T | undefined): string {
    if (!option) {
      if (isArrayValue(value)) {
        return '';
      }

      return value ?? '';
    }

    if (isStringOption(option)) {
      return option;
    }

    if (isObjectOption(option) && canRenderCustomOption(option)) {
      return String(option[optionLabelKey]);
    }
  }

  function getSelectedOption(options: (string | T)[]) {
    return options.find((option) => {
      if (isStringOption(option)) {
        return option === value;
      }

      if (isObjectOption(option) && canRenderCustomOption(option)) {
        return option[optionValueKey] === value;
      }
    });
  }

  /**
   * Given an option that could be an object of type T set internal value in the component to string/string[]
   * or cast it to a string
   * @param option
   */
  const setValue = (option: string | T): void => {
    if (isStringOption(option)) {
      if (isArrayValue(value)) {
        if (value.includes(option)) {
          value = value.filter((o) => o !== option);
        } else {
          value = [...value, option];
        }
      } else {
        value = option;
      }
    }

    if (isObjectOption(option) && canRenderCustomOption(option)) {
      const opt = String(option[optionValueKey]);
      if (isArrayValue(value)) {
        if (value.includes(opt)) {
          value = value.filter((o) => o !== opt);
        } else {
          value = [...value, opt];
        }
      } else {
        value = opt;
      }
    }
  };

  const handleSelectOption = (option: string | T) => {
    setValue(option);
    onchange?.(option);
    if (!multiselect) {
      resetValueAndOptions();
    }
  };

  const removeOption = (option: string) => {
    if (isArrayValue(value)) {
      value = value.filter((o) => o !== option);
    }
  };

  const selectAll = () => {
    if (!multiselect || !isArrayValue(value)) return;

    value = list.map((option) => {
      if (isObjectOption(option) && canRenderCustomOption(option)) {
        return String(option[optionValueKey]);
      } else if (isStringOption(option)) {
        return option;
      }
    });
  };

  const deselectAll = () => {
    value = [];
  };

  const focusFirstOption = () => {
    const listItemElement: HTMLLIElement = menuElement.querySelector(
      'li[role="option"]:not([aria-disabled="true"])',
    );

    if (listItemElement) {
      requestAnimationFrame(() => listItemElement.focus());
    }
  };

  const handleInputKeydown: KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    event.stopPropagation();
    switch (event.key) {
      case 'Escape':
        closeList();
        break;
      case 'ArrowDown':
        openList();
        focusFirstOption();
        break;
      case 'Enter':
        openList();
        focusFirstOption();
        break;
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowLeft':
        break;
      default:
        break;
    }
  };

  const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation();
    openList();
  };

  const handleInput: FormEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation();
    if (!$open) $open = true;
    // Reactive statement at top makes this work, not my favorite tho
    displayValue = event.currentTarget.value;
    filterValue = displayValue;
    oninput?.(displayValue);
  };

  function filterOptions(value: string, options: (T | string)[]) {
    return options.filter((option) => {
      if (isStringOption(option)) {
        return option.toLowerCase().includes(value.toLowerCase());
      }

      if (isObjectOption(option) && canRenderCustomOption(option)) {
        return String(option[optionLabelKey])
          .toLowerCase()
          .includes(value.toLowerCase());
      }
    });
  }

  const handleInputClick: MouseEventHandler<HTMLInputElement> = (event) => {
    event.stopPropagation();
    if (!$open) openList();
  };

  const handleChevronClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    if ($open) {
      closeList();
    } else {
      openList();
    }
  };

  const isSelected = (
    option: string | T,
    value: string | string[],
  ): boolean => {
    if (isObjectOption(option)) {
      const o = String(option[optionValueKey]);
      return isArrayValue(value) ? value.includes(o) : value === o;
    } else if (isStringOption(option)) {
      return isArrayValue(value) ? value.includes(option) : value === option;
    }

    return false;
  };
</script>

<MenuContainer {open} onclose={handleMenuClose}>
  <div class="flex flex-col gap-1">
    <Label hidden={labelHidden} {required} {label} for={id} />
    <div
      class={merge(
        comboboxStyles({ variant }),
        !valid &&
          variant === 'default' &&
          'border border-danger text-danger focus-within:ring-danger/70',
        disabled && 'opacity-50',
        className,
      )}
    >
      {#if leadingIcon}
        <Icon class="ml-2 shrink-0" name={leadingIcon} />
      {/if}
      <div
        class={merge(
          'input-wrapper',
          multiselect && 'gap-1',
          multiselect && 'm-1',
          leadingIcon && multiselect && 'ml-2',
        )}
      >
        {#if multiselect && isArrayValue(value) && value.length > 0}
          {#if displayChips}
            {#each value.slice(0, chipLimit) as v, index (index)}
              <Chip
                onremove={() => removeOption(v)}
                removeButtonLabel={removeChipLabel}>{v}</Chip
              >
            {/each}
            {#if value.length > chipLimit}
              <p>+{value.slice(chipLimit).length}</p>
            {/if}
          {:else}
            <Badge>{numberOfItemsSelectedLabel(value.length)}</Badge>
          {/if}
        {/if}
        <input
          {id}
          {placeholder}
          {required}
          {readonly}
          {disabled}
          type="text"
          value={displayValue}
          class={merge(
            'combobox-input',
            multiselect
              ? value.length > 0 || leadingIcon
                ? 'indent-0'
                : 'indent-1'
              : 'indent-2',
            className,
          )}
          role="combobox"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          data-lpignore="true"
          data-1p-ignore="true"
          aria-controls="{id}-listbox"
          aria-expanded={$open}
          aria-required={required}
          aria-autocomplete="list"
          onfocus={handleFocus}
          oninput={handleInput}
          onkeydown={handleInputKeydown}
          onclick={handleInputClick}
          data-testid={testId}
          bind:this={inputElement}
          {...rest}
        />
      </div>
      {#if action}
        <div class="ml-1 flex h-full items-start border-l border-subtle p-0.5">
          {#if actionTooltip}
            <Tooltip text={actionTooltip} right>
              {@render action()}
            </Tooltip>
          {:else}
            {@render action()}
          {/if}
        </div>
      {:else if href}
        <div class="ml-1 flex h-full items-center border-l border-subtle p-0.5">
          {#if actionTooltip}
            <Tooltip text={actionTooltip} right>
              <Button
                variant="ghost"
                size="xs"
                {href}
                disabled={hrefDisabled}
                leadingIcon="external-link"
              />
            </Tooltip>
          {:else}
            <Button
              variant="ghost"
              size="xs"
              {href}
              disabled={hrefDisabled}
              leadingIcon="external-link"
            />
          {/if}
        </div>
      {/if}
      {#if showChevron}
        <button
          type="button"
          class="hover:bg-gray-100 flex h-full items-center rounded pr-2 focus:outline-none"
          onclick={handleChevronClick}
          aria-label={$open ? 'Close options' : 'Open options'}
          tabindex="-1"
        >
          <Icon
            name="chevron-down"
            class={merge(
              'transition-transform duration-200',
              $open && 'rotate-180',
              !$open && 'rotate-0',
            )}
          />
        </button>
      {/if}
    </div>
  </div>

  <Menu
    keepOpen={multiselect}
    bind:menuElement
    id="{id}-listbox"
    role="listbox"
    class="w-full"
    maxHeight={maxMenuHeight}
  >
    {#if multiselect && isArrayValue(value)}
      <ComboboxOption
        disabled={value.length === options.length}
        onclick={selectAll}
        label={selectAllLabel}
      />
      <ComboboxOption
        disabled={value.length === 0}
        onclick={deselectAll}
        label={deselectAllLabel}
      />
      <MenuDivider />
    {/if}

    {#each list as option, index (index)}
      <ComboboxOption
        onclick={() => handleSelectOption(option)}
        selected={isSelected(option, value)}
        label={getDisplayValue(option)}
        class={optionClass}
      />
    {:else}
      {#if loading === false}
        <ComboboxOption disabled label={noResultsText} />
      {/if}
    {/each}

    {#if loading}
      <ComboboxOption disabled label={loadingText}>
        {#snippet leading()}
          <Icon name="spinner" class="animate-spin" />
        {/snippet}
      </ComboboxOption>
    {/if}
  </Menu>

  {#if error && !valid}
    <span class="error">{error}</span>
  {/if}
</MenuContainer>

<style lang="postcss">
  .error {
    @apply text-xs text-danger;
  }

  .input-wrapper {
    @apply flex w-full flex-wrap items-center;
  }

  .combobox-input {
    @apply flex grow bg-transparent text-primary focus:outline-none;
  }
</style>
