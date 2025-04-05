<script lang="ts">
  import AccordionLight from '$lib/holocene/accordion/accordion-light.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  $: summary = $workflowRun?.userMetadata?.summary;
  $: details = $workflowRun?.userMetadata?.details;
  $: hasUserMetadata = summary || details;
</script>

{#if hasUserMetadata}
  <AccordionLight let:open>
    <div slot="title" class="flex w-full items-center gap-2 p-2 text-xl">
      <Icon name="info" class="text-brand" width={32} height={32} />{translate(
        'workflows.summary-and-details',
      )}
    </div>
    {#if open && summary}
      <h3>{translate('workflows.summary')}</h3>
      <Markdown content={summary} />
    {/if}
    {#if open && details}
      <h3>{translate('workflows.details')}</h3>
      <Markdown content={details} />
    {/if}
  </AccordionLight>
{/if}
