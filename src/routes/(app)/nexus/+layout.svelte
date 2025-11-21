<script lang="ts">
  import type { LayoutProps } from './$types';

  import NexusGuard from '$lib/components/nexus-guard.svelte';

  let { children }: LayoutProps = $props();
</script>

<NexusGuard>
  {#snippet fallback()}
    <p>
      Sorry, this feature is not available in this version of Temporal. Please
      enable Nexus or upgrade to a newer version.
    </p>
  {/snippet}
  {@render children()}
</NexusGuard>
