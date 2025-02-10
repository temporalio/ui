<script lang="ts">
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  interface Props {
    selected?: boolean;
    disabled?: boolean;
    label: string;
  }

  interface DisabledProps {
    label: string;
    disabled: true;
    selected?: never;
  }

  type $$Props = Props | DisabledProps;

  export let selected = false;
  export let disabled = false;
  export let label: string;
</script>

<MenuItem
  on:click
  role="option"
  class="break-all"
  aria-selected={selected}
  aria-disabled={disabled}
  {selected}
  {disabled}
>
  <slot slot="leading" name="leading" />
  {label}
  <slot slot="trailing" name="trailing" />
</MenuItem>
