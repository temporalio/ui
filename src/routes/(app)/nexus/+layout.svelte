<script>
  import NexusGuard, { nexusVersion } from '$lib/components/nexus-guard.svelte';
</script>

<NexusGuard>
  <div slot="fallback">
    <p>
      Sorry, this feature is not available in this version of Temporal. Please
      upgrade to {nexusVersion} to use Nexus
    </p>
  </div>
  <slot />
</NexusGuard>
