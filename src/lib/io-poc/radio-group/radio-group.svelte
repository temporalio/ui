<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import type { RadioGroupOrientation } from './recipe';

  export interface RadioGroupOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }

  export interface RadioGroupProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id' | 'dir'
  > {
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    items?: RadioGroupOption[];
    value?: string | null;
    orientation?: RadioGroupOrientation;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    id?: string;
    onValueChange?: (value: string | null) => void;
    class?: string;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { RadioGroup as ArkRadioGroup } from '@ark-ui/svelte/radio-group';

  import {
    fieldHelperTextRecipe,
    fieldLabelRecipe,
    FieldMessages,
    fieldRequiredIndicatorRecipe,
    getFieldMessageIds,
  } from '$lib/io-poc/field';

  import { radioGroupItemsRecipe, radioGroupRecipe } from './recipe';

  import RadioGroupItem from './radio-group-item.svelte';

  const generatedId = $props.id();
  let {
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    items = [],
    value = $bindable(null),
    orientation = 'vertical',
    name,
    required = false,
    disabled = false,
    readOnly = false,
    id = generatedId,
    onValueChange,
    class: className,
    children,
    ...rest
  }: RadioGroupProps = $props();

  const isInvalid = $derived(invalid ?? !!error);
  const showError = $derived(isInvalid && !!error);
  const messageIds = $derived(
    getFieldMessageIds(id, { helperText, showError }),
  );
</script>

<ArkRadioGroup.Root
  {id}
  bind:value
  {name}
  {orientation}
  {required}
  {disabled}
  {readOnly}
  invalid={isInvalid}
  onValueChange={(details) => onValueChange?.(details.value)}
  aria-describedby={messageIds.describedBy}
  aria-invalid={isInvalid || undefined}
  aria-required={required || undefined}
  class={radioGroupRecipe(className)}
  {...rest}
>
  <ArkRadioGroup.Label class={fieldLabelRecipe({ hidden: labelHidden })}>
    {label}
    {#if required}
      <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
    {/if}
  </ArkRadioGroup.Label>
  <FieldMessages
    ids={messageIds}
    {helperText}
    helperClass={fieldHelperTextRecipe('-mt-1')}
  />
  <div class={radioGroupItemsRecipe(orientation)}>
    {#each items as item (item.value)}
      <RadioGroupItem {...item} />
    {/each}
    {@render children?.()}
  </div>
  <FieldMessages ids={messageIds} {error} {showError} />
</ArkRadioGroup.Root>
