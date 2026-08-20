<script lang="ts" generics="T">
  import { writable, type Writable } from 'svelte/store';

  import { getContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { RadioGroupContext } from './types';

  import { RADIO_GROUP_CONTEXT } from './radio-group.svelte';

  interface Props {
    value: T;
    id: string;
    label: string;
    labelContainerClass?: string;
    description?: string;
    disabled?: boolean;
    class?: string;
    labelBadge?: Snippet;
    icon?: Snippet;
    children?: Snippet;
  }

  let {
    value,
    id,
    label,
    labelContainerClass = '',
    description = '',
    disabled = false,
    class: className = '',
    labelBadge,
    icon,
    children,
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  const internalGroup: Writable<T> = writable(value);
  const internalName = '';

  const ctx = getContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT) ?? {
    name: internalName,
    group: internalGroup,
  };

  const { name, group } = ctx;

  const selected = $derived($group === value);
</script>

<div class={merge('flex flex-col', className)}>
  <div
    class={merge(
      'flex items-start gap-3 border p-4',
      'border-io-border-primary',
      labelContainerClass,
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
        class="radio-card-input mt-0.5 h-5 w-5 shrink-0 appearance-none rounded-full border border-io-border-tertiary bg-io-interactive-secondary"
        {name}
        {value}
        {id}
        {disabled}
      />
      <div class="flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="text-sm font-medium">{label}</span>
          {@render labelBadge?.()}
        </div>
        {#if description}
          <p class="text-sm text-io-content-secondary">{description}</p>
        {/if}
      </div>
    </label>
    {#if icon}
      <div class="shrink-0">
        {@render icon()}
      </div>
    {/if}
  </div>

  {#if selected && children}
    <div
      class="border border-t-0 border-io-border-primary bg-io-background-primary p-5 text-io-content-primary"
    >
      {@render children()}
    </div>
  {/if}
</div>

<style lang="postcss">
  .radio-card-input {
    @apply box-border cursor-pointer outline-none;

    &:checked {
      @apply border-io-interactive-primary bg-io-interactive-primary shadow-[inset_0_0_0_1px] shadow-io-content-inverse-primary;
    }

    &:enabled {
      &:focus-visible {
        @apply ring-2 ring-io-interactive-primary ring-offset-2 ring-offset-io-background-primary;
      }

      &:hover:not(:checked) {
        @apply border-io-border-brand bg-io-actions-hover-overlay;
      }

      &:active:not(:checked) {
        @apply bg-io-actions-press-overlay;
      }

      &:checked:hover {
        @apply border-io-interactive-primary-hover bg-io-interactive-primary-hover;
      }

      &:checked:active {
        @apply border-io-interactive-primary-press bg-io-interactive-primary-press;
      }
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }
</style>
