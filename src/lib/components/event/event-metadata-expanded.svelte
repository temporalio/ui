<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payload } from '$lib/types';

  import MetadataDecoder from './metadata-decoder.svelte';

  let { value }: { value: Payload } = $props();
</script>

<div class="block w-full select-all px-2 py-1 text-left">
  <p class="text-sm">Summary</p>
  <MetadataDecoder {value} fallback={translate('events.decode-failed')}>
    {#snippet children(decodedValue)}
      <Badge type="secondary" class="inline-block whitespace-pre-wrap">
        {decodedValue}
      </Badge>
    {/snippet}
  </MetadataDecoder>
</div>
