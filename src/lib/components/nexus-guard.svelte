<script context="module">
  export const nexusVersion = '1.25.0';
</script>

<script lang="ts">
  import { temporalVersion } from '$lib/stores/versions';
  import { minimumVersionRequired } from '$lib/utilities/version-check';
</script>

{#if minimumVersionRequired(nexusVersion, $temporalVersion)}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
