<script lang="ts">
  import { page } from '$app/state';

  import type { LayoutProps } from './$types';

  import StandaloneNexusOperationsDisabled from '$lib/components/standalone-nexus-operations/standalone-nexus-operations-disabled.svelte';
  import StandaloneNexusOperationsGuard from '$lib/components/standalone-nexus-operations/standalone-nexus-operations-guard.svelte';

  let { children }: LayoutProps = $props();
</script>

<StandaloneNexusOperationsGuard namespace={page.data.namespace}>
  {@render children()}
  {#snippet fallback()}
    <StandaloneNexusOperationsDisabled
      href={page.url.href}
      namespace={page.params.namespace}
    />
  {/snippet}
</StandaloneNexusOperationsGuard>
