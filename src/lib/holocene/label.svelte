<script lang="ts">
  import type { HTMLLabelAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  interface Props extends HTMLLabelAttributes {
    label?: string;
    hidden?: boolean;
    required?: boolean;
    disabled?: boolean;
    'data-testid'?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    label = '',
    hidden = false,
    required = false,
    disabled = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();
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
  {...rest}
>
  {#if children}{@render children()}{:else}<span>{label}</span>{/if}
  {#if required}
    <span class="h-1.5 w-1.5 rounded-full bg-interactive-error"></span>
  {/if}
</label>
