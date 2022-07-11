<script lang="ts">
  export let href: string = '';
</script>

{#if href}
  <a {href}>
    <slot />
    <td />
  </a>
{:else}
  <tr>
    <slot />
    <td />
  </tr>
{/if}
