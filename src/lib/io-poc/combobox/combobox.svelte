<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type {
    ComboboxInteractOutsideEvent,
    ComboboxValueChangeDetails,
  } from '@ark-ui/svelte/combobox';

  export interface ComboboxItem {
    label: string;
    value: string;
    disabled?: boolean;
  }

  export interface ComboboxProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children'
  > {
    items: (ComboboxItem | string)[];
    value?: string[];
    inputValue?: string;
    open?: boolean;
    multiple?: boolean;
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    placeholder?: string;
    allowCustomValue?: boolean;
    clearable?: boolean;
    openOnClick?: boolean;
    emptyText?: string;
    clearLabel?: string;
    triggerLabel?: string;
    portalled?: boolean;
    onInteractOutside?: (event: ComboboxInteractOutsideEvent) => void;
    id?: string;
    name?: string;
    class?: string;
    onValueChange?: (details: ComboboxValueChangeDetails<ComboboxItem>) => void;
  }
</script>

<script lang="ts">
  import {
    Combobox as ArkCombobox,
    createListCollection,
  } from '@ark-ui/svelte/combobox';
  import { useFilter } from '@ark-ui/svelte/locale';
  import { Portal } from '@ark-ui/svelte/portal';

  import { IconCheckmark, IconChevronDown, IconClose } from '$lib/io/icon';
  import { Field } from '$lib/io-poc/field';

  import {
    comboboxContentRecipe,
    comboboxControlRecipe,
    comboboxEmptyRecipe,
    comboboxIconButtonRecipe,
    comboboxInputRecipe,
    comboboxItemRecipe,
    comboboxTagRecipe,
    comboboxTagRemoveRecipe,
  } from './recipe';

  let {
    items,
    value = $bindable([]),
    inputValue = $bindable(''),
    open = $bindable(false),
    multiple = false,
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    required = false,
    disabled = false,
    readOnly = false,
    placeholder,
    allowCustomValue = false,
    clearable = true,
    openOnClick = true,
    emptyText = 'No results',
    clearLabel = 'Clear selection',
    triggerLabel = 'Show options',
    portalled = true,
    onInteractOutside,
    id,
    name,
    class: className,
    onValueChange,
    ...rest
  }: ComboboxProps = $props();

  const filter = useFilter({ sensitivity: 'base' });
  let query = $state('');

  const normalizedItems = $derived<ComboboxItem[]>(
    items.map((item) =>
      typeof item === 'string' ? { label: item, value: item } : item,
    ),
  );

  const filteredItems = $derived(
    query
      ? normalizedItems.filter((item) => filter().contains(item.label, query))
      : normalizedItems,
  );

  const collection = $derived(
    createListCollection<ComboboxItem>({
      items: filteredItems,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
      isItemDisabled: (item) => !!item.disabled,
    }),
  );

  const selectedItems = $derived(
    value.map(
      (selected) =>
        normalizedItems.find((item) => item.value === selected) ?? {
          label: selected,
          value: selected,
        },
    ),
  );

  const isInteractive = $derived(!disabled && !readOnly);

  function removeValue(removed: string) {
    value = value.filter((selected) => selected !== removed);
  }
</script>

<Field
  {label}
  {labelHidden}
  {helperText}
  {error}
  {invalid}
  {required}
  {disabled}
  {readOnly}
  {id}
  class={className}
  {...rest}
>
  <ArkCombobox.Root
    {collection}
    bind:value
    bind:inputValue
    bind:open
    {multiple}
    {name}
    {allowCustomValue}
    {openOnClick}
    selectionBehavior={multiple ? 'clear' : 'replace'}
    closeOnSelect={!multiple}
    positioning={{ sameWidth: true, gutter: 4 }}
    lazyMount
    unmountOnExit
    onInputValueChange={(details) => {
      query = details.reason === 'input-change' ? details.inputValue : '';
    }}
    onOpenChange={(details) => {
      if (!details.open) query = '';
    }}
    {onValueChange}
    {onInteractOutside}
  >
    <ArkCombobox.Control class={comboboxControlRecipe()}>
      {#if multiple}
        {#each selectedItems as item (item.value)}
          <span class={comboboxTagRecipe()}>
            <span class="truncate">{item.label}</span>
            {#if isInteractive}
              <button
                type="button"
                class={comboboxTagRemoveRecipe()}
                aria-label="Remove {item.label}"
                onclick={() => removeValue(item.value)}
              >
                <IconClose width={12} height={12} />
              </button>
            {/if}
          </span>
        {/each}
      {/if}
      <ArkCombobox.Input
        {placeholder}
        class={comboboxInputRecipe()}
        data-track-name="combobox"
        data-track-intent="select"
        data-track-text={label}
      />
      {#if clearable && isInteractive && value.length > 0}
        <ArkCombobox.ClearTrigger
          class={comboboxIconButtonRecipe()}
          aria-label={clearLabel}
        >
          <IconClose width={16} height={16} />
        </ArkCombobox.ClearTrigger>
      {/if}
      <ArkCombobox.Trigger
        class={comboboxIconButtonRecipe()}
        aria-label={triggerLabel}
      >
        <IconChevronDown width={16} height={16} />
      </ArkCombobox.Trigger>
    </ArkCombobox.Control>
    <Portal disabled={!portalled}>
      <ArkCombobox.Positioner class="z-50">
        <ArkCombobox.Content class={comboboxContentRecipe()}>
          <ArkCombobox.Empty class={comboboxEmptyRecipe()}
            >{emptyText}</ArkCombobox.Empty
          >
          {#each collection.items as item (item.value)}
            <ArkCombobox.Item {item} class={comboboxItemRecipe()}>
              <ArkCombobox.ItemText class="truncate"
                >{item.label}</ArkCombobox.ItemText
              >
              <ArkCombobox.ItemIndicator class="shrink-0 text-brand">
                <IconCheckmark width={16} height={16} />
              </ArkCombobox.ItemIndicator>
            </ArkCombobox.Item>
          {/each}
        </ArkCombobox.Content>
      </ArkCombobox.Positioner>
    </Portal>
  </ArkCombobox.Root>
</Field>
