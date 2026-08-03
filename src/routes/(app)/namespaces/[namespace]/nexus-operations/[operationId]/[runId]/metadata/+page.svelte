<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import StandaloneNexusOperationMetadata from '$lib/pages/standalone-nexus-operation-metadata.svelte';

  const operationId = $derived(page.params.operationId);
</script>

<PageTitle
  title="Nexus Operation Execution User Metadata | {operationId}"
  url={page.url.href}
/>

<StandaloneNexusOperationMetadata />
