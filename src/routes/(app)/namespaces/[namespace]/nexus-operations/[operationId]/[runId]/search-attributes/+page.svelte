<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import StandaloneNexusOperationSearchAttributes from '$lib/pages/standalone-nexus-operation-search-attributes.svelte';

  const operationId = $derived(page.params.operationId);
</script>

<PageTitle
  title="Nexus Operation Execution Search Attributes | {operationId}"
  url={page.url.href}
/>

<StandaloneNexusOperationSearchAttributes />
