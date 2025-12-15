<script lang="ts">
  import Markdown from '$lib/holocene/markdown-editor/preview.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  import MetadataEvents from './metadata-events.svelte';

  const summary = $derived($workflowRun?.userMetadata?.summary);
  const details = $derived($workflowRun?.userMetadata?.details);
</script>

<div class="flex h-full flex-1 flex-col bg-primary">
  <div>
    <div class="surface-secondary w-full px-6 py-2">
      <h3 data-testid="user-metadata-summary-heading">
        {translate('workflows.summary')}
      </h3>
    </div>
    {#if summary}
      <Markdown class="p-3" overrideTheme="primary" content={summary} />
    {:else}
      <div class="py-6 pl-6 text-secondary/70">
        <p class="text-sm italic">
          {translate('workflows.no-summary-available')}
        </p>
      </div>
    {/if}
  </div>
  <div>
    <div class="surface-secondary w-full px-6 py-2">
      <h3 data-testid="user-metadata-summary-heading">
        {translate('workflows.details')}
      </h3>
    </div>
    {#if details}
      <Markdown class="p-3" overrideTheme="primary" content={details} />
    {:else}
      <div class="py-6 pl-6 text-secondary/70">
        <p class="text-sm italic">
          {translate('workflows.no-details-available')}
        </p>
      </div>
    {/if}
  </div>
  <div>
    <div class="surface-secondary w-full px-6 py-2">
      <h3 data-testid="user-metadata-summary-heading">Events with Metadata</h3>
    </div>
    <div class="py-6">
      <MetadataEvents />
    </div>
  </div>
</div>
