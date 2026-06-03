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

  $: descriptionId = description ? `${name}-description` : undefined;

  setContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT, {
    name,
    group,
  });
</script>

<div
  role="radiogroup"
  aria-labelledby={descriptionId}
  class={merge('flex flex-col gap-4 p-1', className)}
  {...$$restProps}
>
  {#if description}
    <p id={descriptionId} class="text-sm font-medium">{description}</p>
  {/if}
  <slot />
</div>
