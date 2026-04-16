<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { getContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { RadioGroupContext } from './types';

  import { RADIO_GROUP_CONTEXT } from './radio-group.svelte';

  type T = $$Generic;

  export let value: T;
  export let id: string;
  export let label: string;
  export let description: string = '';
  export let disabled: boolean = false;

  let className: string = '';
  export { className as class };

  let internalGroup: Writable<T> = writable(value);
  let internalName: string = '';

  const ctx = getContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT) ?? {
    name: internalName,
    group: internalGroup,
  };

  const { name, group } = ctx;

  $: selected = $group === value;
</script>

<div class={merge('flex flex-col', className)}>
  <div
    class={merge(
      'flex items-start gap-3 border p-4',
      'border-subtle',
      disabled && 'opacity-50',
    )}
  >
    <label
      class={merge(
        'flex flex-1 cursor-pointer items-start gap-3',
        disabled && 'cursor-not-allowed',
      )}
      for={id}
    >
      <input
        bind:group={$group}
        type="radio"
        class="radio-card-input surface-primary mt-0.5 h-5 w-5 shrink-0 appearance-none rounded-full border border-secondary"
        {name}
        {value}
        {id}
        {disabled}
      />
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium">{label}</span>
          <slot name="label-badge" />
        </div>
        {#if description}
          <p class="text-sm text-secondary">{description}</p>
        {/if}
      </div>
    </label>
    {#if $$slots.icon}
      <div class="shrink-0">
        <slot name="icon" />
      </div>
    {/if}
  </div>

  {#if selected && $$slots.default}
    <div class="surface-background border border-t-0 border-subtle p-5">
      <slot />
    </div>
  {/if}
</div>

<style lang="postcss">
  .radio-card-input {
    @apply box-border cursor-pointer outline-none;

    &:checked {
      @apply bg-interactive shadow-[inset_0_0_0_1px] shadow-white dark:shadow-black;
    }

    &:enabled {
      &:focus-visible,
      &:hover {
        @apply bg-interactive-active ring-2 ring-primary/70;

        &:not(:active) {
          @apply border-inverse;
        }
      }
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }
</style>
