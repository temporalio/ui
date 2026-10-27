<script lang="ts" module>
  import type { HTMLFieldsetAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  export interface FieldsetProps extends Omit<
    HTMLFieldsetAttributes,
    'class' | 'children' | 'id' | 'disabled'
  > {
    legend: string;
    id?: string;
    legendHidden?: boolean;
    helperText?: string;
    error?: string;
    invalid?: boolean;
    disabled?: boolean;
    class?: string;
    children?: Snippet;
  }
</script>

<script lang="ts">
  import { Fieldset as ArkFieldset } from '@ark-ui/svelte/fieldset';

  import {
    fieldErrorTextRecipe,
    fieldHelperTextRecipe,
  } from '$lib/io-poc/field';

  import { fieldsetLegendRecipe, fieldsetRecipe } from './recipe';

  let {
    legend,
    legendHidden = false,
    helperText = '',
    error = '',
    invalid,
    disabled = false,
    class: className,
    children,
    ...rest
  }: FieldsetProps = $props();

  const isInvalid = $derived(invalid ?? !!error);
</script>

<ArkFieldset.Root
  invalid={isInvalid}
  {disabled}
  class={fieldsetRecipe(className)}
  {...rest}
>
  <ArkFieldset.Legend class={fieldsetLegendRecipe({ hidden: legendHidden })}
    >{legend}</ArkFieldset.Legend
  >
  {#if helperText}
    <ArkFieldset.HelperText class={fieldHelperTextRecipe()}
      >{helperText}</ArkFieldset.HelperText
    >
  {/if}
  {@render children?.()}
  {#if isInvalid && error}
    <ArkFieldset.ErrorText class={fieldErrorTextRecipe()}
      >{error}</ArkFieldset.ErrorText
    >
  {/if}
</ArkFieldset.Root>
