<script lang="ts">
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  interface Props {
    selected?: boolean;
    disabled?: boolean;
  }

  interface DisabledProps {
    disabled: true;
    selected?: never;
  }

  type $$Props = Props | DisabledProps;

  export let selected: boolean = false;
  export let disabled: boolean = false;
</script>

<MenuItem
  on:click
  role="option"
  class="break-all"
  aria-selected={selected}
  aria-disabled={disabled}
  {disabled}
  {selected}
>
  <slot slot="leading" name="leading" />
  <slot />
  <slot slot="trailing" name="trailing" />
</MenuItem>
