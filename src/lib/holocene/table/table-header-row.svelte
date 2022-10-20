<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { noop } from 'svelte/internal';

  export let selectable: boolean = false;
  export let selected: boolean = false;
  export let indeterminate: boolean = false;
</script>

<tr class={$$props.class}>
  <th />
  {#if selectable}
    <th class="w-8">
      <Checkbox
        class="mt-1"
        onDark
        bind:checked={selected}
        {indeterminate}
        on:change
      />
    </th>
  {/if}
  <slot />
  <th />
</tr>
