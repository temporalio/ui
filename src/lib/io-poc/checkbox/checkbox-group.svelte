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
    fieldHelperTextRecipe,
    fieldLabelRecipe,
    FieldMessages,
    fieldRequiredIndicatorRecipe,
    getFieldMessageIds,
  } from '$lib/io-poc/field';

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
  const isInvalid = $derived(invalid ?? !!error);
  const showError = $derived(isInvalid && !!error);
  const messageIds = $derived(
    getFieldMessageIds(id, { helperText, showError }),
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
  <FieldMessages
    ids={messageIds}
    {helperText}
    helperClass={fieldHelperTextRecipe('-mt-1')}
  />
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
    aria-describedby={messageIds.describedBy}
    aria-invalid={isInvalid || undefined}
    aria-required={required || undefined}
    data-orientation={orientation}
    class={checkboxGroupItemsRecipe(orientation)}
    {...rest}
  >
    {@render children?.()}
  </ArkCheckbox.Group>
  <FieldMessages ids={messageIds} {error} {showError} />
</div>
