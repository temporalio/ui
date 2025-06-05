<script lang="ts">
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  const summary = $derived($workflowRun?.userMetadata?.summary);
  const details = $derived($workflowRun?.userMetadata?.details);
</script>

<div class="flex flex-1 flex-col gap-2">
  <h3>{translate('workflows.summary-and-details')}</h3>
  {#if summary}
    <h3>{translate('workflows.summary')}</h3>
    <Markdown content={summary} />
  {/if}
  {#if details}
    <h3>{translate('workflows.details')}</h3>
    <Markdown content={details} />
  {/if}
</div>
