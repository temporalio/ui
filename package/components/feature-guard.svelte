<script>export let enabled = false;
</script>

{#if enabled}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
