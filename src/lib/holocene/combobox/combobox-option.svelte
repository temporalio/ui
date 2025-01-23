<script lang="ts">
  import type { Snippet } from 'svelte';

  import Checkbox, { type ChangeEvent } from '$lib/holocene/checkbox.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  interface BaseProps {
    label: string;
    leading?: Snippet;
    trailing?: Snippet;
    onclick?: (e: MouseEvent | ChangeEvent) => void;
  }

  interface EnabledProps extends BaseProps {
    selected?: boolean;
    disabled?: boolean;
    multiselect?: boolean;
  }

  interface DisabledProps extends BaseProps {
    selected?: never;
    disabled: true;
    multiselect?: never;
  }

  type Props = EnabledProps | DisabledProps;

  let {
    selected = false,
    disabled = false,
    multiselect = false,
    label,
    leading: leading_render,
    trailing,
    onclick = () => {},
  }: Props = $props();
</script>

<MenuItem
  {onclick}
  role="option"
  class="break-all"
  aria-selected={selected}
  aria-disabled={disabled}
  selected={!multiselect && selected}
  {disabled}
  {trailing}
>
  {#snippet leading()}
    {#if leading_render}
      {@render leading_render()}
    {:else if multiselect}
      <Checkbox
        onchange={onclick}
        checked={selected}
        tabindex={-1}
        {label}
        labelHidden
      />
    {/if}
  {/snippet}
  {label}
</MenuItem>
