<script lang="ts">
  import Checkbox from '../checkbox.svelte';

  export let href: string = '';
  export let selectable: boolean = false;
  export let selected: boolean = false;
</script>

{#if href}
  <a class="table-row {$$props.class}" {href}>
    <td class:selectable>
      {#if selectable}
        <Checkbox class="mt-2" bind:checked={selected} on:change />
      {/if}
    </td>
    <slot />
    <td />
  </a>
{:else}
  <tr on:click class={$$props.class}>
    <td class:selectable>
      {#if selectable}
        <Checkbox class="mt-2" bind:checked={selected} on:change />
      {/if}
    </td>
    <slot />
    <td />
  </tr>
{/if}
