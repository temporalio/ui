<script lang="ts" context="module">
  export const RADIO_GROUP_CONTEXT = 'radio-group-ctx';
</script>

<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { setContext } from 'svelte';

  import type { RadioGroupContext, RadioGroupProps } from './types';

  type T = $$Generic;
  type $$Props = RadioGroupProps<T>;

  let className: string = '';

  export { className as class };
  export let name: string;
  export let group: Writable<T>;

  setContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT, {
    name,
    group,
  });
</script>

<div class="flex flex-col gap-2 {className}" {...$$restProps}>
  <slot />
</div>
