<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import StandaloneNexusOperationDetails from '$lib/pages/standalone-nexus-operation-details.svelte';

  const operationId = $derived(page.params.operationId);
</script>

<PageTitle
  title="Nexus Operation Execution Details | {operationId}"
  url={page.url.href}
/>

<StandaloneNexusOperationDetails />
