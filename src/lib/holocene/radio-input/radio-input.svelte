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
  export let disabled = false;

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

<div class="flex flex-col gap-1">
  <label class:disabled>
    <input
      bind:group={$group}
      type="radio"
      aria-describedby="{id}-description"
      {name}
      {value}
      {id}
      {disabled}
      {...$$restProps}
    />
    <span class="label" class:hidden={labelHidden}>
      {label}
    </span>
  </label>
  {#if description}
    <p class="description" id="{id}-description">
      {description}
    </p>
  {/if}
</div>

<style lang="postcss">
  .description {
    @apply ml-[26px] text-xs font-normal text-primary;
  }

  label {
    @apply flex grow cursor-pointer flex-row items-center gap-2 text-sm font-normal text-primary focus:outline-none;

    &.disabled {
      @apply cursor-not-allowed;
    }
  }

  input[type='radio'] {
    @apply relative box-content h-4 w-4 min-w-[16px] cursor-pointer appearance-none rounded-full border border-2 border-subtle bg-transparent outline outline-4 outline-transparent dark:text-black;

    &::after {
      @apply absolute left-1 top-1 h-0 w-0 scale-0 rounded-full bg-interactive transition-transform content-[''];
    }

    &:enabled {
      &:focus-visible,
      &:hover {
        @apply border-transparent border-white bg-interactive outline-offset-0 outline-focus dark:border-black;
      }
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }

  input[type='radio']:checked {
    @apply bg-interactive shadow-[inset_0_0_0_2px] shadow-white dark:shadow-black;

    &:enabled {
      &:focus-visible,
      &:hover {
        @apply border-white shadow-none dark:border-black;
      }
    }

    &::after {
      @apply h-2 w-2 scale-100;
    }
  }
</style>
