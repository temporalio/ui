<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { nexusOperationExecution } from '$lib/utilities/standalone-nexus-operation-poller.svelte';

  const searchAttributes = $derived(
    $nexusOperationExecution?.info?.searchAttributes,
  );
</script>

<div class="flex flex-col gap-2">
  {#if searchAttributes}
    <PayloadCodeBlock value={searchAttributes.indexedFields} />
  {:else}
    <p>{translate('events.empty-search-attributes')}</p>
  {/if}
</div>
