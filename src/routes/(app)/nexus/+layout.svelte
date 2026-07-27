<script lang="ts">
  import type { Snippet } from 'svelte';

  import NexusGuard from '$lib/components/nexus-guard.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
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
