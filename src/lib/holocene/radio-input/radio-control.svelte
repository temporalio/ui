<script lang="ts" generics="T">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { Writable } from 'svelte/store';

  import { twMerge as merge } from 'tailwind-merge';

  interface Props extends HTMLInputAttributes {
    group: Writable<T>;
    value: T;
    class?: string;
  }

  let { group, value, class: className = undefined, ...rest }: Props = $props();
</script>

<input
  bind:group={$group}
  {value}
  {...rest}
  type="radio"
  class={merge(
    'radio-control box-border h-5 w-5 cursor-pointer appearance-none rounded-full border border-secondary bg-background-primary outline-none',
    className,
  )}
/>

<style lang="postcss">
  .radio-control {
    &:checked {
      @apply bg-interactive-primary;

      box-shadow: inset 0 0 0 3px var(--color-background-primary);
    }

    &:enabled {
      &:focus-visible {
        @apply ring-2 ring-interactive-primary ring-offset-2 ring-offset-background-primary;
      }

      &:hover:not(:checked),
      &:focus-visible:not(:checked) {
        @apply border-tertiary;
      }

      &:checked:hover,
      &:checked:focus-visible {
        @apply border-brand;
      }
    }

    &:enabled[aria-invalid='true'] {
      @apply border-danger;

      &:hover,
      &:focus-visible {
        @apply border-danger;
      }
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }
</style>
