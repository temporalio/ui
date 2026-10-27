<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type {
    SelectInteractOutsideEvent,
    SelectValueChangeDetails,
  } from '@ark-ui/svelte/select';

  export interface SelectItem {
    label: string;
    value: string;
    disabled?: boolean;
    group?: string;
  }

  export interface SelectProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id'
  > {
    items: (SelectItem | string)[];
    value?: string[];
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
    clearable?: boolean;
    clearLabel?: string;
    portalled?: boolean;
    onInteractOutside?: (event: SelectInteractOutsideEvent) => void;
    id?: string;
    name?: string;
    class?: string;
    onValueChange?: (details: SelectValueChangeDetails<SelectItem>) => void;
  }
</script>

<script lang="ts">
  import { Portal } from '@ark-ui/svelte/portal';
  import {
    Select as ArkSelect,
    createListCollection,
  } from '@ark-ui/svelte/select';

  import { IconCheckmark, IconChevronDown, IconClose } from '$lib/io/icon';
  import {
    fieldLabelRecipe,
    FieldMessages,
    fieldRequiredIndicatorRecipe,
    getFieldMessageIds,
  } from '$lib/io-poc/field';

  import {
    selectContentRecipe,
    selectControlRecipe,
    selectIconButtonRecipe,
    selectIndicatorRecipe,
    selectItemGroupLabelRecipe,
    selectItemRecipe,
    selectRecipe,
    selectTriggerRecipe,
    selectValueTextRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    items,
    value = $bindable([]),
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
    placeholder = 'Select an option',
    clearable = false,
    clearLabel = 'Clear selection',
    portalled = true,
    onInteractOutside,
    id = generatedId,
    name,
    class: className,
    onValueChange,
    ...rest
  }: SelectProps = $props();

  const normalizedItems = $derived<SelectItem[]>(
    items.map((item) =>
      typeof item === 'string' ? { label: item, value: item } : item,
    ),
  );

  const hasGroups = $derived(normalizedItems.some((item) => item.group));

  const collection = $derived(
    createListCollection<SelectItem>({
      items: normalizedItems,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value,
      isItemDisabled: (item) => !!item.disabled,
      groupBy: (item) => item.group ?? '',
    }),
  );

  const isInvalid = $derived(invalid ?? !!error);
  const showError = $derived(!!(isInvalid && error));
  const messageIds = $derived(
    getFieldMessageIds(id, { helperText, showError, errorFirst: true }),
  );
  const isInteractive = $derived(!disabled && !readOnly);
</script>

{#snippet itemRow(item: SelectItem)}
  <ArkSelect.Item {item} class={selectItemRecipe()}>
    <ArkSelect.ItemText class="truncate">{item.label}</ArkSelect.ItemText>
    <ArkSelect.ItemIndicator class="shrink-0 text-brand">
      <IconCheckmark width={16} height={16} />
    </ArkSelect.ItemIndicator>
  </ArkSelect.Item>
{/snippet}

<ArkSelect.Root
  {id}
  {collection}
  bind:value
  {open}
  onOpenChange={(details) => (open = details.open)}
  {multiple}
  {name}
  {required}
  {disabled}
  {readOnly}
  invalid={isInvalid}
  closeOnSelect={!multiple}
  positioning={{ sameWidth: true, gutter: 4 }}
  lazyMount
  unmountOnExit
  {onValueChange}
  {onInteractOutside}
  class={selectRecipe(className)}
  {...rest}
>
  <ArkSelect.Label class={fieldLabelRecipe({ hidden: labelHidden })}>
    {label}
    {#if required}
      <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
    {/if}
  </ArkSelect.Label>
  <ArkSelect.Control class={selectControlRecipe()}>
    <ArkSelect.Trigger
      class={selectTriggerRecipe()}
      aria-describedby={messageIds.describedBy}
      data-track-name="select"
      data-track-intent="select"
      data-track-text={label}
    >
      <ArkSelect.ValueText {placeholder} class={selectValueTextRecipe()} />
      <ArkSelect.Indicator class={selectIndicatorRecipe()}>
        <IconChevronDown width={16} height={16} />
      </ArkSelect.Indicator>
    </ArkSelect.Trigger>
    {#if clearable && isInteractive && value.length > 0}
      <ArkSelect.ClearTrigger
        class={selectIconButtonRecipe()}
        aria-label={clearLabel}
      >
        <IconClose width={16} height={16} />
      </ArkSelect.ClearTrigger>
    {/if}
  </ArkSelect.Control>
  <FieldMessages ids={messageIds} {helperText} {error} {showError} />
  <Portal disabled={!portalled}>
    <ArkSelect.Positioner class="z-50">
      <ArkSelect.Content class={selectContentRecipe()}>
        {#if hasGroups}
          {#each collection.group() as [group, groupItems] (group)}
            <ArkSelect.ItemGroup>
              {#if group}
                <ArkSelect.ItemGroupLabel class={selectItemGroupLabelRecipe()}
                  >{group}</ArkSelect.ItemGroupLabel
                >
              {/if}
              {#each groupItems as item (item.value)}
                {@render itemRow(item)}
              {/each}
            </ArkSelect.ItemGroup>
          {/each}
        {:else}
          {#each collection.items as item (item.value)}
            {@render itemRow(item)}
          {/each}
        {/if}
      </ArkSelect.Content>
    </ArkSelect.Positioner>
  </Portal>
  <ArkSelect.HiddenSelect />
</ArkSelect.Root>
