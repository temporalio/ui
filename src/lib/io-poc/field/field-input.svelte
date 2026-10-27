<script lang="ts" module>
  import type { HTMLInputAttributes } from 'svelte/elements';

  export interface FieldInputProps extends Omit<HTMLInputAttributes, 'class'> {
    class?: string;
  }
</script>

<script lang="ts">
  import { Field as ArkField } from '@ark-ui/svelte/field';

  import { fieldInputRecipe } from './recipe';

  let {
    value = $bindable(),
    class: className,
    ...rest
  }: FieldInputProps = $props();
</script>

<ArkField.Input bind:value class={fieldInputRecipe(className)} {...rest} />
