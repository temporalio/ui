<script lang="ts" generics="T">
  import { writable } from 'svelte/store';

  import { getContext } from 'svelte';

  import Label from '$lib/holocene/label.svelte';

  import type { RadioGroupContext, RadioInputProps } from './types';

  import { RADIO_GROUP_CONTEXT } from './radio-group.svelte';

  let {
    value,
    id,
    label,
    description = undefined,
    labelHidden = false,
    disabled = false,
    group: internalGroup = writable(value),
    name: internalName = '',
    class: className = undefined,
    ...rest
  }: RadioInputProps<T> = $props();

  const ctx = getContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT) ?? {
    get name() {
      return internalName;
    },
    get group() {
      return internalGroup;
    },
  };

  const { name, group } = ctx;
</script>

<div>
  <div class="flex items-center">
    <Label
      {disabled}
      class={className
        ? `radio-input-hit-target ${className}`
        : 'radio-input-hit-target'}
    >
      <input
        bind:group={$group}
        type="radio"
        class="surface-primary"
        aria-describedby={description ? `${id}-description` : null}
        data-track-name="radio-input"
        data-track-intent="select"
        data-track-text={label}
        {name}
        {value}
        {id}
        {disabled}
        {...rest}
      />
      <span class="font-normal" class:hidden={labelHidden}>
        {label}
      </span>
    </Label>
  </div>
  {#if description}
    <p class="description" id="{id}-description">
      {description}
    </p>
  {/if}
</div>

<style lang="postcss">
  .description {
    @apply ml-7 text-sm font-normal text-primary;
  }

  input[type='radio'] {
    @apply box-border h-5 w-5 cursor-pointer appearance-none rounded-full border border-primary outline-none;

    &:checked {
      @apply bg-interactive;
    }

    &:enabled {
      &:focus-visible,
      &:hover {
        @apply bg-interactive-active ring-2 ring-primary;

        &:checked {
          &:not(:active) {
            @apply shadow-none;
          }
        }

        &:not(:active) {
          @apply border-inverse;
        }
      }
    }

    &:checked,
    &:active {
      box-shadow: inset 0 0 0 1px rgb(var(--color-surface-primary));
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }

  @media (pointer: coarse) {
    :global(.radio-input-hit-target) {
      min-height: var(--target-size);
    }
  }
</style>
