<script lang="ts">
  import type { Writable } from 'svelte/store';

  import type { Payloads } from '$lib/types';
  import { atob } from '$lib/utilities/atob';
  import { getSinglePayload } from '$lib/utilities/encode-payload';

  import PayloadDecoder from '../event/payload-decoder.svelte';
  import PayloadInputWithEncoding, {
    isPayloadInputEncodingType,
    type PayloadInputEncoding,
  } from '../payload-input-with-encoding.svelte';

  export let input: string;
  export let encoding: Writable<PayloadInputEncoding>;
  export let payloads: Payloads;

  let loading = true;

  const setInitialInput = (decodedValue: string): void => {
    input = getSinglePayload(decodedValue);
    const currentEncoding = atob(
      String(payloads?.payloads[0]?.metadata?.encoding ?? 'json/plain'),
    );
    if (isPayloadInputEncodingType(currentEncoding)) {
      $encoding = currentEncoding;
    }
    loading = false;
  };
</script>

<div class="flex flex-col gap-1">
  <PayloadDecoder value={payloads} key="payloads" onDecode={setInitialInput}>
    <PayloadInputWithEncoding
      bind:input
      bind:encoding
      bind:loading
      id="schedule-payload-input"
    />
  </PayloadDecoder>
</div>
