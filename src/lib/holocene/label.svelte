<script lang="ts">
  import type { HTMLLabelAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  type $$Props = HTMLLabelAttributes & {
    label?: string;
    hidden?: boolean;
    required?: boolean;
    disabled?: boolean;
    'data-testid'?: string;
    class?: string;
  };

  export let label = '';
  export let hidden = false;
  export let required = false;
  export let disabled = false;

  let className = '';
  export { className as class };
</script>

<label
  class={merge(
    'inline-flex',
    'flex-row',
    'items-center',
    'grow',
    'cursor-pointer',
    'gap-2',
    'text-primary',
    'text-sm',
    'font-medium',
    'focus:outline-none',
    hidden && 'sr-only',
    disabled && 'cursor-not-allowed',
    className,
  )}
  data-required={required}
  {...$$restProps}
>
  <slot><span>{label}</span></slot>
  {#if required}
    <span class="h-1.5 w-1.5 rounded-full bg-interactive-error"></span>
  {/if}
</label>
