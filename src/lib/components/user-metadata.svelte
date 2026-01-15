<script lang="ts">
  import Markdown from '$lib/holocene/markdown-editor/preview.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { UserMetadata } from '$lib/types';

  import PayloadDecoder from './event/payload-decoder.svelte';

  interface Props {
    userMetadata: UserMetadata | undefined;
  }

  let { userMetadata }: Props = $props();

  let summary = $derived(userMetadata?.summary);
  let details = $derived(userMetadata?.details);
</script>

<div>
  <div class="surface-information w-full px-6 py-2">
    <h3 data-testid="user-metadata-summary-heading">
      {translate('workflows.summary')}
    </h3>
  </div>
  {#if summary}
    <PayloadDecoder value={summary}>
      {#snippet children(content)}
        <Markdown class="p-3" overrideTheme="primary" {content} />
      {/snippet}
    </PayloadDecoder>
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
    <PayloadDecoder value={details}>
      {#snippet children(content)}
        <Markdown class="p-3" overrideTheme="primary" {content} />
      {/snippet}
    </PayloadDecoder>
  {:else}
    <div class="py-6 pl-6 text-secondary/70">
      <p class="text-sm italic">
        {translate('workflows.no-details-available')}
      </p>
    </div>
  {/if}
</div>
