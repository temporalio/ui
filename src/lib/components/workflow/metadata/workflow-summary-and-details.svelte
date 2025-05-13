<script lang="ts">
  import AccordionLight from '$lib/holocene/accordion/accordion-light.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Markdown from '$lib/holocene/monaco/markdown.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';

  const summary = $derived($workflowRun?.userMetadata?.summary);
  const details = $derived($workflowRun?.userMetadata?.details);
  const hasUserMetadata = $derived(summary || details);
</script>

{#if hasUserMetadata}
  <AccordionLight>
    {#snippet titleName()}
      <div class="flex w-full items-center gap-2 p-2 text-xl">
        <Icon
          name="info"
          class="text-brand"
          width={32}
          height={32}
        />{translate('workflows.summary-and-details')}
      </div>
    {/snippet}
    {#snippet children({ open })}
      {#if open && summary}
        <h3>{translate('workflows.summary')}</h3>
        <Markdown content={summary} />
      {/if}
      {#if open && details}
        <h3>{translate('workflows.details')}</h3>
        <Markdown content={details} />
      {/if}
    {/snippet}
  </AccordionLight>
{/if}
