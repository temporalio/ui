<script>export let href = '';
</script>

{#if href}
  <a class="table-row {$$props.class}" {href}>
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
