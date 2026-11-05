<script lang="ts">
  import NexusOperationCallbacksTable from '$lib/components/standalone-nexus-operations/nexus-operation-callbacks-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { nexusOperationExecution } from '$lib/utilities/standalone-nexus-operation-poller.svelte';

  let { namespace }: { namespace: string } = $props();

  const callbacks = $derived(
    $nexusOperationExecution?.completionCallbacks ?? [],
  );
</script>

<section class="flex flex-col gap-5">
  <header class="flex flex-col gap-1">
    <h2>{translate('nexus.callbacks')}</h2>
    <p class="text-sm text-secondary">{translate('nexus.callbacks-intro')}</p>
  </header>
  <NexusOperationCallbacksTable {callbacks} {namespace} />
</section>
