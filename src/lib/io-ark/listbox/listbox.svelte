<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type {
    ListboxSelectionMode as ArkListboxSelectionMode,
    ListboxValueChangeDetails,
  } from '@ark-ui/svelte/listbox';

  export interface ListboxItem {
    label: string;
    value: string;
    description?: string;
    disabled?: boolean;
    group?: string;
  }

  export type ListboxSelectionMode = ArkListboxSelectionMode;

  export interface ListboxProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id'
  > {
    items: (ListboxItem | string)[];
    value?: string[];
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    disabled?: boolean;
    selectionMode?: ListboxSelectionMode;
    orientation?: 'horizontal' | 'vertical';
    filterable?: boolean;
    filterPlaceholder?: string;
    emptyText?: string;
    id?: string;
    class?: string;
    onValueChange?: (details: ListboxValueChangeDetails<ListboxItem>) => void;
  }
</script>

<script lang="ts">
  import {
    Listbox as ArkListbox,
    createListCollection,
  } from '@ark-ui/svelte/listbox';
  import { useFilter } from '@ark-ui/svelte/locale';

  import { IconCheckmark } from '$lib/io/icon';
  import {
    fieldErrorTextRecipe,
    fieldHelperTextRecipe,
    fieldLabelRecipe,
  } from '$lib/io-ark/field';

  import {
    listboxContentRecipe,
    listboxEmptyRecipe,
    listboxInputRecipe,
    listboxItemGroupLabelRecipe,
    listboxItemRecipe,
    listboxPanelRecipe,
    listboxRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    items,
    value = $bindable([]),
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    disabled = false,
    selectionMode = 'single',
    orientation = 'vertical',
    filterable = false,
    filterPlaceholder = 'Filter options',
    emptyText = 'No results',
    id = generatedId,
    class: className,
    onValueChange,
    ...rest
  }: ListboxProps = $props();

  const filter = useFilter({ sensitivity: 'base' });
  let query = $state('');

  const normalizedItems = $derived<ListboxItem[]>(
    items.map((item) =>
      typeof item === 'string' ? { label: item, value: item } : item,
    ),
  );

  const filteredItems = $derived(
    query
      ? normalizedItems.filter((item) => filter().contains(item.label, query))
      : normalizedItems,
  );

  const hasGroups = $derived(normalizedItems.some((item) => item.group));

  const collection = $derived(
    createListCollection<ListboxItem>({
      items: filteredItems,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
      isItemDisabled: (item) => !!item.disabled,
      groupBy: (item) => item.group ?? '',
    }),
  );

  const isInvalid = $derived(invalid ?? !!error);
  const helperTextId = $derived(`${id}-helper-text`);
  const errorTextId = $derived(`${id}-error-text`);
  const describedBy = $derived(
    [isInvalid && error && errorTextId, helperText && helperTextId]
      .filter(Boolean)
      .join(' ') || undefined,
  );
</script>

{#snippet itemRow(item: ListboxItem)}
  <ArkListbox.Item {item} class={listboxItemRecipe()}>
    <span class="flex min-w-0 flex-col">
      <ArkListbox.ItemText class="truncate">{item.label}</ArkListbox.ItemText>
      {#if item.description}
        <span class="truncate text-xs font-normal text-secondary"
          >{item.description}</span
        >
      {/if}
    </span>
    <ArkListbox.ItemIndicator class="shrink-0 text-brand">
      <IconCheckmark width={16} height={16} />
    </ArkListbox.ItemIndicator>
  </ArkListbox.Item>
{/snippet}

<ArkListbox.Root
  {id}
  {collection}
  bind:value
  {disabled}
  {selectionMode}
  {orientation}
  typeahead={!filterable}
  {onValueChange}
  class={listboxRecipe(className)}
  {...rest}
>
  <ArkListbox.Label class={fieldLabelRecipe({ hidden: labelHidden })}
    >{label}</ArkListbox.Label
  >
  <div
    class={listboxPanelRecipe()}
    data-invalid={isInvalid ? '' : undefined}
    data-disabled={disabled ? '' : undefined}
  >
    {#if filterable}
      <ArkListbox.Input
        value={query}
        oninput={(event) => (query = event.currentTarget.value)}
        placeholder={filterPlaceholder}
        aria-label={`${label}: ${filterPlaceholder}`}
        class={listboxInputRecipe()}
      />
    {/if}
    <ArkListbox.Content
      class={listboxContentRecipe(orientation)}
      aria-describedby={describedBy}
      aria-invalid={isInvalid ? 'true' : undefined}
      data-track-name="listbox"
      data-track-intent="select"
      data-track-text={label}
    >
      <ArkListbox.Empty class={listboxEmptyRecipe()}
        >{emptyText}</ArkListbox.Empty
      >
      {#if hasGroups}
        {#each collection.group() as [group, groupItems] (group)}
          <ArkListbox.ItemGroup>
            {#if group}
              <ArkListbox.ItemGroupLabel class={listboxItemGroupLabelRecipe()}
                >{group}</ArkListbox.ItemGroupLabel
              >
            {/if}
            {#each groupItems as item (item.value)}
              {@render itemRow(item)}
            {/each}
          </ArkListbox.ItemGroup>
        {/each}
      {:else}
        {#each collection.items as item (item.value)}
          {@render itemRow(item)}
        {/each}
      {/if}
    </ArkListbox.Content>
  </div>
  {#if helperText}
    <p id={helperTextId} class={fieldHelperTextRecipe()}>{helperText}</p>
  {/if}
  {#if isInvalid && error}
    <p id={errorTextId} class={fieldErrorTextRecipe()} aria-live="polite">
      {error}
    </p>
  {/if}
</ArkListbox.Root>
