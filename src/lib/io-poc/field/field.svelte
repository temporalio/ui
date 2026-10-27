<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  export interface FieldProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children'
  > {
    label: string;
    labelHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    id?: string;
    class?: string;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { Field as ArkField } from '@ark-ui/svelte/field';

  import {
    fieldErrorTextRecipe,
    fieldHelperTextRecipe,
    fieldLabelRecipe,
    fieldRecipe,
    fieldRequiredIndicatorRecipe,
  } from './recipe';

  let {
    label,
    labelHidden = false,
    helperText = '',
    error = '',
    invalid,
    required = false,
    disabled,
    readOnly = false,
    id,
    class: className,
    children,
    ...rest
  }: FieldProps = $props();

  const isInvalid = $derived(invalid ?? !!error);
</script>

<ArkField.Root
  ids={id ? { control: id } : undefined}
  invalid={isInvalid}
  {required}
  {disabled}
  {readOnly}
  class={fieldRecipe(className)}
  {...rest}
>
  <ArkField.Label class={fieldLabelRecipe({ hidden: labelHidden })}>
    {label}
    {#if required}
      <ArkField.RequiredIndicator class={fieldRequiredIndicatorRecipe()}
        >*</ArkField.RequiredIndicator
      >
    {/if}
  </ArkField.Label>
  {@render children?.()}
  {#if helperText}
    <ArkField.HelperText class={fieldHelperTextRecipe()}
      >{helperText}</ArkField.HelperText
    >
  {/if}
  {#if isInvalid && error}
    <ArkField.ErrorText class={fieldErrorTextRecipe()}
      >{error}</ArkField.ErrorText
    >
  {/if}
</ArkField.Root>
