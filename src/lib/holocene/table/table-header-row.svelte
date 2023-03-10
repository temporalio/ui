<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';

  export let selectable: boolean = false;
  export let selected: boolean = false;
  export let checkboxLabel: string = null;
  export let indeterminate: boolean = false;
</script>

<tr class={$$props.class}>
  <th />
  {#if selectable}
    <th class:selectable>
      <Checkbox
        id="selectable-table-check-all"
        onDark
        bind:checked={selected}
        {indeterminate}
        label={checkboxLabel}
        on:change
      />
    </th>
  {/if}
  <slot />
  <th />
</tr>
