<script lang="ts">
  import { writable, type Writable } from 'svelte/store';

  import { getContext } from 'svelte';

  import Label from '$lib/holocene/label.svelte';
  import { omit } from '$lib/utilities/omit';

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
  let className: string | undefined = undefined;

  export { internalGroup as group };
  export { internalName as name };
  export { className as class };

  const ctx = getContext<RadioGroupContext<T>>(RADIO_GROUP_CONTEXT) ?? {
    name: internalName,
    group: internalGroup,
  };

  const { name, group } = ctx;
</script>

<div>
  <Label {disabled} class={className}>
    <input
      bind:group={$group}
      type="radio"
      class="surface-primary"
      aria-describedby={description ? `${id}-description` : null}
      {name}
      {value}
      {id}
      {disabled}
      {...omit($$restProps, 'class')}
    />
    <span class="label" class:hidden={labelHidden}>
      {label}
    </span>
  </Label>
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
    @apply box-border h-5 w-5 cursor-pointer appearance-none rounded-full border border-secondary outline-none;

    &:checked {
      @apply bg-interactive;
    }

    &:enabled {
      &:focus-visible,
      &:hover {
        @apply bg-interactive-active ring-2 ring-primary/70;

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
      @apply shadow-[inset_0_0_0_1px] shadow-white dark:shadow-black;
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }
</style>
