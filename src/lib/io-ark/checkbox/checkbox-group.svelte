<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import type { CheckboxGroupOrientation } from './recipe';

  export interface CheckboxGroupProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children'
  > {
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    value?: string[];
    name?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    orientation?: CheckboxGroupOrientation;
    maxSelectedValues?: number;
    onValueChange?: (value: string[]) => void;
    id?: string;
    class?: string;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { Checkbox as ArkCheckbox } from '@ark-ui/svelte/checkbox';

  import {
    fieldErrorTextRecipe,
    fieldHelperTextRecipe,
    fieldLabelRecipe,
    fieldRequiredIndicatorRecipe,
  } from '$lib/io-ark/field';

  import { checkboxGroupItemsRecipe, checkboxGroupRecipe } from './recipe';

  const generatedId = $props.id();
  let {
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    value = $bindable([]),
    name,
    disabled,
    readOnly,
    required = false,
    orientation = 'vertical',
    maxSelectedValues,
    onValueChange,
    id = generatedId,
    class: className,
    children,
    ...rest
  }: CheckboxGroupProps = $props();

  const labelId = $derived(`${id}-label`);
  const helperTextId = $derived(`${id}-helper-text`);
  const errorTextId = $derived(`${id}-error-text`);
  const isInvalid = $derived(invalid ?? !!error);
  const showError = $derived(isInvalid && !!error);
  const describedBy = $derived(
    [helperText && helperTextId, showError && errorTextId]
      .filter(Boolean)
      .join(' ') || undefined,
  );
</script>

<div class={checkboxGroupRecipe(className)}>
  <span
    id={labelId}
    data-disabled={disabled ? '' : undefined}
    class={fieldLabelRecipe({ hidden: labelHidden })}
  >
    {label}
    {#if required}
      <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
    {/if}
  </span>
  {#if helperText}
    <p id={helperTextId} class={fieldHelperTextRecipe('-mt-1')}>
      {helperText}
    </p>
  {/if}
  <ArkCheckbox.Group
    {id}
    bind:value
    {name}
    {disabled}
    {readOnly}
    {maxSelectedValues}
    invalid={isInvalid}
    {onValueChange}
    aria-labelledby={labelId}
    aria-describedby={describedBy}
    aria-invalid={isInvalid || undefined}
    aria-required={required || undefined}
    data-orientation={orientation}
    class={checkboxGroupItemsRecipe(orientation)}
    {...rest}
  >
    {@render children?.()}
  </ArkCheckbox.Group>
  {#if showError}
    <p id={errorTextId} aria-live="polite" class={fieldErrorTextRecipe()}>
      {error}
    </p>
  {/if}
</div>
