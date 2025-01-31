<script lang="ts" module>
  import type { Snippet } from 'svelte';

  type BaseProps = {
    label: string;
    leading?: Snippet;
    trailing?: Snippet;
    onclick?: (e: MouseEvent) => void;
  };

  type EnabledProps = BaseProps & {
    selected?: boolean;
    disabled?: boolean;
  };

  type DisabledProps = BaseProps & {
    selected?: never;
    disabled: true;
  };

  export type Props = EnabledProps | DisabledProps;
</script>

<script lang="ts">
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  let {
    selected = false,
    disabled = false,
    label,
    leading: leadingChildren,
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
    {@render leadingChildren?.()}
  {/snippet}
  {label}
</MenuItem>
