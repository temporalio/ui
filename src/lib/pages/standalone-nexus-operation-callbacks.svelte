<script lang="ts">
  import { page } from '$app/state';

  import NexusOperationCallbacksFilter from '$lib/components/standalone-nexus-operations/nexus-operation-callbacks-filter.svelte';
  import NexusOperationCallbacksTable from '$lib/components/standalone-nexus-operations/nexus-operation-callbacks-table.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    appliedCallbackFilterCount,
    callbackFilterUpdate,
    filterCallbacks,
    parseCallbackFilters,
  } from '$lib/utilities/nexus-operation-callback-filters';
  import { nexusOperationExecution } from '$lib/utilities/standalone-nexus-operation-poller.svelte';
  import { updateMultipleQueryParameters } from '$lib/utilities/update-query-parameters';

  let { namespace }: { namespace: string } = $props();

  const callbacks = $derived(
    $nexusOperationExecution?.completionCallbacks ?? [],
  );
  const filters = $derived(parseCallbackFilters(page.url));
  const filteredCallbacks = $derived(filterCallbacks(callbacks, filters));

  const clearFilters = () => {
    updateMultipleQueryParameters({
      ...callbackFilterUpdate({ endpoint: [], service: [], operation: [] }),
      url: page.url,
    });
  };
</script>

<section class="flex flex-col gap-4">
  <header class="flex flex-wrap items-end justify-between gap-4">
    <div class="flex flex-col gap-1">
      <h2>{translate('nexus.callbacks')}</h2>
      <p class="text-sm text-secondary">{translate('nexus.callbacks-intro')}</p>
    </div>
    <NexusOperationCallbacksFilter {callbacks} />
  </header>
  <NexusOperationCallbacksTable
    callbacks={filteredCallbacks}
    filtered={appliedCallbackFilterCount(filters) > 0}
    onClearFilters={clearFilters}
    {namespace}
  />
</section>
