<script lang="ts">
  import { isCloud } from '$lib/stores/advanced-visibility';
  import { temporalVersion } from '$lib/stores/versions';
  import { minimumVersionRequired } from '$lib/utilities/version-check';

  export let minimumVersion: string;
</script>

{#if $isCloud || minimumVersionRequired(minimumVersion, $temporalVersion)}
  <slot />
{:else}
  <slot name="fallback" />
{/if}
