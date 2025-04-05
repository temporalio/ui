<script lang="ts">
  export let error = null;
</script>

{#if $error}
  <slot name="fallback">Error Rendering Component</slot>
{:else}
  <slot />
{/if}
