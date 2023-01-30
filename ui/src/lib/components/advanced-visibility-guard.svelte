<script lang="ts">
  import { supportsAdvancedVisibility } from '$lib/stores/bulk-actions';
</script>

{#if $supportsAdvancedVisibility}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
