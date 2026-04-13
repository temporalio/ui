<script lang="ts">
  import Payload from '$lib/components/payload/payload.svelte';
  import { translate } from '$lib/i18n/translate';
  import { activityExecution } from '$lib/utilities/standalone-activity-poller.svelte';

  const searchAttributes = $derived($activityExecution?.info?.searchAttributes);
</script>

<div class="flex flex-col gap-2">
  {#if searchAttributes}
    <Payload
      value={{ searchAttributes: searchAttributes }}
      key="searchAttributes"
      copyIconTitle={translate('common.copy-icon-title')}
      copySuccessIconTitle={translate('common.copy-success-icon-title')}
    />
  {:else}
    <p>{translate('events.empty-search-attributes')}</p>
  {/if}
</div>
