<script>
  import NexusGuard from '$lib/components/nexus-guard.svelte';
</script>

<NexusGuard>
  <div slot="fallback">
    <p>
      Sorry, this feature is not available in this version of Temporal. Please
      enable Nexus or upgrade to a newer version.
    </p>
  </div>
  <slot />
</NexusGuard>
