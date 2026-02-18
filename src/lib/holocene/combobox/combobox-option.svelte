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
    active?: boolean;
    selected?: boolean;
    disabled?: boolean;
  }

  interface DisabledProps extends BaseProps {
    active?: never;
    disabled: true;
    selected?: never;
  }

  type Props = EnabledProps | DisabledProps;

  let {
    active = false,
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
  {active}
  {selected}
  {disabled}
  {leading}
  {trailing}
>
  {label}
</MenuItem>
