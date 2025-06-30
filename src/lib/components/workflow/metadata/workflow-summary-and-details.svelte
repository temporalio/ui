<script lang="ts">
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  const summary = $derived($workflowRun?.userMetadata?.summary);
  const details = $derived($workflowRun?.userMetadata?.details);
</script>

<div class="flex flex-1 flex-col items-center gap-2 p-6">
  {#if summary}
    <div class="border border-subtle">
      <h3 class="pl-6 pt-6" data-testid="user-metadata-summary-heading">
        {translate('workflows.summary')}
      </h3>
      <Markdown className="p-2" overrideTheme="primary" content={summary} />
    </div>
  {/if}
  {#if details}
    <div class="border border-subtle">
      <h3 class="pl-6 pt-6" data-testid="user-metadata-details-heading">
        {translate('workflows.details')}
      </h3>
      <Markdown className="p-2" overrideTheme="primary" content={details} />
    </div>
  {/if}
</div>
