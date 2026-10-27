<script lang="ts" module>
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  export interface FieldTextareaProps extends Omit<
    HTMLTextareaAttributes,
    'class'
  > {
    class?: string;
  }
</script>

<script lang="ts">
  import { Field as ArkField } from '@ark-ui/svelte/field';

  import { fieldTextareaRecipe } from './recipe';

  let {
    value = $bindable(),
    rows = 3,
    class: className,
    ...rest
  }: FieldTextareaProps = $props();
</script>

<ArkField.Textarea
  bind:value
  {rows}
  class={fieldTextareaRecipe(className)}
  {...rest}
/>
