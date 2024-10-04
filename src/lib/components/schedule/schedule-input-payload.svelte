<script lang="ts">
  import type { Payloads } from '$lib/types';
  import { atob } from '$lib/utilities/atob';
  import { getSinglePayload } from '$lib/utilities/encode-payload';

  import PayloadDecoder from '../event/payload-decoder.svelte';
  import PayloadInput from '../payload-input.svelte';

  export let input: string;
  export let encoding: string;
  export let payloads: Payloads;

  let loading = true;

  const setInitialInput = (decodedValue: string): void => {
    input = getSinglePayload(decodedValue);
    encoding = atob(
      String(payloads?.payloads[0]?.metadata?.encoding ?? 'json/plain'),
    );
    loading = false;
  };
</script>

<div class="flex flex-col gap-1">
  <PayloadDecoder value={payloads} key="payloads" onDecode={setInitialInput}>
    {#key loading}
      <PayloadInput bind:input bind:encoding />
    {/key}
  </PayloadDecoder>
</div>
