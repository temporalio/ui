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
  export let description: string | undefined = undefined;
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
  <span class="label" class:hidden={labelHidden}>
    {#if description}<strong>{description}</strong>{/if}{label}
  </span>
</label>

<style lang="postcss">
  label {
    @apply flex grow cursor-pointer flex-row items-start gap-1 text-sm focus:outline-none;
  }

  input[type='radio'] {
    @apply relative box-content h-4 w-4 min-w-[16px] cursor-pointer appearance-none rounded-full border border-gray-300 bg-white;

    &::after {
      @apply absolute top-1 left-1 h-0 w-0 scale-0 rounded-full bg-white transition-transform content-[''];
    }
  }

  input[type='radio']:checked {
    @apply border-indigo-600 bg-indigo-600;

    &::after {
      @apply h-2 w-2 scale-100;
    }
  }
</style>
