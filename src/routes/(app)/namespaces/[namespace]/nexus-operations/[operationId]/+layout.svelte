<script lang="ts">
  import type { LayoutProps } from './$types';

  import StandaloneNexusOperationLayout from '$lib/layouts/standalone-nexus-operation-layout.svelte';

  let { params, children }: LayoutProps = $props();

  const namespace = $derived(params.namespace);
  const operationId = $derived(params.operationId);
</script>

<StandaloneNexusOperationLayout {namespace} {operationId}>
  {@render children()}
</StandaloneNexusOperationLayout>
