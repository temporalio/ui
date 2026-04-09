<script lang="ts">
  import Payload from '$lib/components/payload.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payload as RawPayload } from '$lib/types';

  export let value: RawPayload;
</script>

<div class="block w-full select-all px-2 py-1 text-left">
  <p class="text-sm">Summary</p>
  <Payload {value} mode="summary" fallback={translate('events.decode-failed')}>
    {#snippet children(decodedValue)}
      <Badge type="secondary" class="inline-block whitespace-pre-wrap">
        {decodedValue}
      </Badge>
    {/snippet}
  </Payload>
</div>
