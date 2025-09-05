<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  interface Props {
    selected?: boolean;
    disabled?: boolean;
    label: string;
    class?: string;
  }

  interface DisabledProps {
    label: string;
    disabled: true;
    selected?: never;
    class?: string;
  }

  type $$Props = Props | DisabledProps;

  export let selected = false;
  export let disabled = false;
  export let label: string;
  let className = '';
  export { className as class };
</script>

<MenuItem
  on:click
  role="option"
  class={merge('break-all', className)}
  aria-selected={selected}
  aria-disabled={disabled}
  {selected}
  {disabled}
>
  <slot slot="leading" name="leading" />
  {label}
  <slot slot="trailing" name="trailing" />
</MenuItem>
