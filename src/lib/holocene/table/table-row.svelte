<script lang="ts">
  export let href: string = '';
</script>

{#if href}
  <a class=" table-row {$$props.class}" {href}>
    <td />
    <slot />
    <td />
  </a>
{:else}
  <tr class={$$props.class}>
    <td />
    <slot />
    <td />
  </tr>
{/if}
