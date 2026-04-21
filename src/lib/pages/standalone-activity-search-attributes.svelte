<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { activityExecution } from '$lib/utilities/standalone-activity-poller.svelte';

  const searchAttributes = $derived($activityExecution?.info?.searchAttributes);
</script>

<div class="flex flex-col gap-2">
  {#if searchAttributes}
    <PayloadCodeBlock
      value={{ searchAttributes: searchAttributes }}
      fieldName="searchAttributes"
    />
  {:else}
    <p>{translate('events.empty-search-attributes')}</p>
  {/if}
</div>
