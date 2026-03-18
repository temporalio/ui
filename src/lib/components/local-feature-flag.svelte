<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { FeatureFlag } from '$lib/stores/feature-flags';
  import { isFeatureFlagEnabled } from '$lib/stores/feature-flags';

  interface Props {
    key: FeatureFlag;
    children: Snippet;
    fallback?: Snippet;
  }

  let { key, children, fallback }: Props = $props();

  const enabled = isFeatureFlagEnabled(key);
</script>

{#if $enabled}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
