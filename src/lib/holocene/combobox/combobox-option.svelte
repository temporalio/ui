<script lang="ts">
  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  interface BaseProps {
    label: string;
    class?: ClassNameValue;
    onclick?: () => void;
    leading?: Snippet;
    trailing?: Snippet;
  }

  interface EnabledProps extends BaseProps {
    selected?: boolean;
    disabled?: boolean;
  }

  interface DisabledProps extends BaseProps {
    disabled: true;
    selected?: never;
  }

  type Props = EnabledProps | DisabledProps;

  let {
    selected = false,
    disabled = false,
    label,
    class: className = '',
    onclick,
    leading,
    trailing,
  }: Props = $props();
</script>

<MenuItem
  role="option"
  class={merge('break-all', className)}
  aria-selected={selected}
  aria-disabled={disabled}
  {onclick}
  {selected}
  {disabled}
  {leading}
  {trailing}
>
  {label}
</MenuItem>
