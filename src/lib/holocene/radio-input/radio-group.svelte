<script lang="ts" module>
  export const RADIO_GROUP_CONTEXT = 'radio-group-ctx';
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { RadioGroupContext, RadioGroupProps } from './types';

  type T = $$Generic;

  let {
    class: className = '',
    name,
    group = $bindable(),
    description = '',
    children,
    ...rest
  }: RadioGroupProps<T> = $props();

  setContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT, {
    name,
    group,
  });
</script>

<div class={merge('flex flex-col gap-2 p-1', className)} {...rest}>
  {#if description}
    <p class="text-sm font-medium">{description}</p>
  {/if}
  {@render children?.()}
</div>
