<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';

  export let selectable: boolean = false;
  export let selected: boolean = false;
  export let checkboxLabel: string = null;
  export let indeterminate: boolean = false;
</script>

<tr class={$$props.class}>
  <th class:selectable>
    {#if selectable}
      <Checkbox
        onDark
        bind:checked={selected}
        {indeterminate}
        label={checkboxLabel}
        on:change
      />
    {/if}
  </th>
  <slot />
  <th class:selectable />
</tr>
