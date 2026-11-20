<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import StandaloneNexusOperationCallbacks from '$lib/pages/standalone-nexus-operation-callbacks.svelte';

  const operationId = $derived(page.params.operationId);
  const namespace = $derived(page.params.namespace);
</script>

<PageTitle
  title="Nexus Operation Execution Callbacks | {operationId}"
  url={page.url.href}
/>

<StandaloneNexusOperationCallbacks {namespace} />
