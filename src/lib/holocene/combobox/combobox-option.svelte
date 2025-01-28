<script lang="ts">
  import type { Snippet } from 'svelte';

  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  interface BaseProps {
    label: string;
    leading?: Snippet;
    trailing?: Snippet;
    onclick?: (e: MouseEvent) => void;
  }
  interface EnabledProps extends BaseProps {
    selected?: boolean;
    disabled?: boolean;
  }

  interface DisabledProps extends BaseProps {
    selected?: never;
    disabled: true;
  }

  type Props = EnabledProps | DisabledProps;

  let {
    selected = false,
    disabled = false,
    label,
    leading: leading_render,
    trailing,
    onclick,
  }: Props = $props();
</script>

<MenuItem
  {onclick}
  role="option"
  class="break-all"
  aria-selected={selected}
  aria-disabled={disabled}
  {selected}
  {disabled}
  {trailing}
>
  {#snippet leading()}
    {@render leading_render?.()}
  {/snippet}
  {label}
</MenuItem>
