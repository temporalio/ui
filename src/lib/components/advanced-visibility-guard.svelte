<script lang="ts">
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
</script>

{#if $supportsAdvancedVisibility}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
