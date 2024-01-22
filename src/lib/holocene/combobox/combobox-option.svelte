<script lang="ts">
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  interface Props {
    selected?: boolean;
    disabled?: boolean;
    theme?: 'dark' | 'light';
  }

  interface DisabledProps {
    disabled: true;
    selected?: never;
  }

  type $$Props = Props | DisabledProps;

  export let selected = false;
  export let disabled = false;
  export let theme: 'light' | 'dark' = 'light';
</script>

<MenuItem
  on:click
  role="option"
  class="break-all"
  aria-selected={selected}
  aria-disabled={disabled}
  {disabled}
  {selected}
  {theme}
>
  <slot slot="leading" name="leading" />
  <slot />
  <slot slot="trailing" name="trailing" />
</MenuItem>
