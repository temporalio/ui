<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';

  const dispatch = createEventDispatcher<{ click: undefined }>();

  interface Props {
    selected?: boolean;
    disabled?: boolean;
    multiselect?: boolean;
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
  export let multiselect = false;
  export let label: string;
</script>

<MenuItem
  on:click
  role="option"
  class="break-all"
  aria-selected={selected}
  aria-disabled={disabled}
  selected={!multiselect && selected}
  {disabled}
>
  <slot slot="leading" name="leading">
    {#if multiselect}
      <Checkbox on:change={() => dispatch('click')} checked={selected} />
    {/if}
  </slot>
  {label}
  <slot slot="trailing" name="trailing" />
</MenuItem>
