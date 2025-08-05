<script lang="ts">
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  import MetadataEvents from './metadata-events.svelte';

  const summary = $derived($workflowRun?.userMetadata?.summary);
  const details = $derived($workflowRun?.userMetadata?.details);
</script>

<div class="flex h-full flex-1 flex-col gap-2 p-6">
  <div class="border border-subtle">
    <h3 class="pl-6 pt-6" data-testid="user-metadata-summary-heading">
      {translate('workflows.summary')}
    </h3>
    {#if summary}
      <Markdown className="p-3" overrideTheme="primary" content={summary} />
    {:else}
      <div class="pb-6 pl-6 text-secondary/70">
        <p class="text-sm italic">
          {translate('workflows.no-summary-available')}
        </p>
      </div>
    {/if}
  </div>
  <div class="border border-subtle">
    <h3 class="pl-6 pt-6" data-testid="user-metadata-details-heading">
      {translate('workflows.details')}
    </h3>
    {#if details}
      <Markdown className="p-3" overrideTheme="primary" content={details} />
    {:else}
      <div class="pb-6 pl-6 text-secondary/70">
        <p class="text-sm italic">
          {translate('workflows.no-details-available')}
        </p>
      </div>
    {/if}
  </div>
  <MetadataEvents />
</div>
