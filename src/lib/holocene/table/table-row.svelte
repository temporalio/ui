<script lang="ts">
  import Checkbox from '../checkbox.svelte';

  export let href: string = '';
  export let selectable: boolean = false;
  export let selected: boolean = false;
</script>

{#if href}
  <a class="table-row {$$props.class}" {href}>
    <td />
    {#if selectable}
      <td>
        <Checkbox class="mt-2" bind:checked={selected} on:change />
      </td>
    {/if}
    <slot />
    <td />
  </a>
{:else}
  <tr on:click class={$$props.class}>
    <td />
    {#if selectable}
      <td>
        <Checkbox class="mt-2" bind:checked={selected} on:change />
      </td>
    {/if}
    <slot />
    <td />
  </tr>
{/if}
