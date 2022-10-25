<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';

  export let selectable: boolean = false;
  export let selected: boolean = false;
  export let indeterminate: boolean = false;
</script>

<tr class={$$props.class}>
  <th class:selectable>
    {#if selectable}
      <Checkbox
        class="mt-1"
        onDark
        bind:checked={selected}
        {indeterminate}
        on:change
      />
    {/if}
  </th>
  <slot />
  <th class:selectable />
</tr>
