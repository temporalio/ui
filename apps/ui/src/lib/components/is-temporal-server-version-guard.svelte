<script lang="ts">
  import type { Snippet } from 'svelte';

  import { isCloud } from '$lib/stores/advanced-visibility';
  import { temporalVersion } from '$lib/stores/versions';
  import { minimumVersionRequired } from '$lib/utilities/version-check';

  let {
    minimumVersion,
    children,
    fallback,
  }: {
    minimumVersion: string;
    children?: Snippet;
    fallback?: Snippet;
  } = $props();
</script>

{#if $isCloud || minimumVersionRequired(minimumVersion, $temporalVersion)}
  {@render children?.()}
{:else}
  {@render fallback?.()}
{/if}
