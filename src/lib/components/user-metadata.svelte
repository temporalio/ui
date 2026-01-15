<script lang="ts">
  import Markdown from '$lib/holocene/markdown-editor/preview.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    summary: string;
    details: string;
  }

  let { summary, details }: Props = $props();
</script>

<div class="flex h-full flex-1 flex-col bg-primary">
  <div>
    <div class="surface-information w-full px-6 py-2">
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
    <div class="surface-information w-full px-6 py-2">
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
</div>
