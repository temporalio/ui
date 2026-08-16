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
      'relative flex items-start gap-2 overflow-hidden rounded-panel border p-3 transition-colors duration-fast',
      'border-subtle',
      selected &&
        'rounded-b-none border-primary bg-interactive-secondary-hover before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-interactive',
      labelContainerClass,
      disabled && 'opacity-50',
    )}
  >
    <label
      class={merge(
        'flex min-w-0 flex-1 cursor-pointer items-start gap-2.5',
        disabled && 'cursor-not-allowed',
      )}
      for={id}
    >
      <input
        bind:group={$group}
        type="radio"
        class="radio-card-input surface-primary mt-0.5 h-5 w-5 shrink-0 appearance-none rounded-full border border-primary"
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
          <p class="text-sm text-secondary">{description}</p>
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
      class="surface-background rounded-b-panel border border-t-0 border-subtle p-3"
    >
      {@render children()}
    </div>
  {/if}
</div>

<style lang="postcss">
  .radio-card-input {
    @apply box-border cursor-pointer outline-none;

    &:checked {
      @apply bg-interactive;

      box-shadow: inset 0 0 0 1px rgb(var(--color-surface-primary));
    }

    &:enabled {
      &:focus-visible,
      &:hover {
        @apply bg-interactive-active ring-2 ring-primary;

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
