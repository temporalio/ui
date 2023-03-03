<script lang="ts">
  export let href: string = '';
</script>

{#if href}
  <a class="table-row align-middle {$$props.class}" {href}>
    <td />
    <slot />
    <td />
  </a>
{:else}
  <tr on:click class={$$props.class}>
    <td />
    <slot />
    <td />
  </tr>
{/if}
