<script lang="ts" context="module">
  export const RADIO_GROUP_CONTEXT = 'radio-group-ctx';
</script>

<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { setContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { RadioGroupContext, RadioGroupProps } from './types';

  type T = $$Generic;
  type $$Props = RadioGroupProps<T> & { class?: string };

  let className: string = '';

  export { className as class };
  export let name: string;
  export let group: Writable<T>;
  export let description = '';

  setContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT, {
    name,
    group,
  });
</script>

<div class={merge('flex flex-col gap-2 p-1', className)} {...$$restProps}>
  {#if description}
    <p class="text-sm font-medium">{description}</p>
  {/if}
  <slot />
</div>
