<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { getContext } from 'svelte';

  import type { RadioGroupContext, RadioInputProps } from './types';

  import { RADIO_GROUP_CONTEXT } from './radio-group.svelte';

  type T = $$Generic;

  type $$Props = RadioInputProps<T>;
  export let value: T;
  export let id: string;
  export let label: string;
  export let labelHidden = false;

  let internalGroup: Writable<T> = writable(value);
  let internalName: string = '';

  export { internalGroup as group };
  export { internalName as name };

  const ctx = getContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT) ?? {
    name: internalName,
    group: internalGroup,
  };

  const { name, group } = ctx;
</script>

<label>
  <input
    bind:group={$group}
    type="radio"
    {name}
    {value}
    {id}
    {...$$restProps}
  />
  <span class="checkmark" />
  <span class="label" class:hidden={labelHidden}>
    {label}
  </span>
</label>

<style lang="postcss">
  label {
    @apply relative flex grow cursor-pointer flex-row items-center gap-1 text-sm focus:outline-none;
  }

  input[type='radio'] {
    @apply sr-only;
  }

  input[type='radio']:checked + .checkmark {
    @apply border-indigo-600 bg-indigo-600 after:block;
  }

  .label {
    @apply ml-6;
  }

  .checkmark {
    @apply absolute left-0 box-content h-4 w-4 rounded-full border border-gray-300 bg-white;
  }

  .checkmark::after {
    @apply absolute top-1 left-1 hidden h-2 w-2 rounded-full bg-white content-[''];
  }
</style>
