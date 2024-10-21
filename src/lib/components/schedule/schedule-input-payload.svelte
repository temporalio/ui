<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';
  import { atob } from '$lib/utilities/atob';
  import { getSinglePayload } from '$lib/utilities/encode-payload';

  import PayloadDecoder from '../event/payload-decoder.svelte';
  import PayloadInput, {
    isPayloadInputEncodingType,
    type PayloadInputEncoding,
  } from '../payload-input.svelte';

  export let input: string;
  export let editInput: boolean;
  export let encoding: Writable<PayloadInputEncoding>;
  export let payloads: Payloads;
  export let showEditActions: boolean = false;

  let initialInput = '';
  let loading = true;

  const setInitialInput = (decodedValue: string): void => {
    initialInput = getSinglePayload(decodedValue);
    input = initialInput;
    const currentEncoding = atob(
      String(payloads?.payloads[0]?.metadata?.encoding ?? 'json/plain'),
    );
    if (isPayloadInputEncodingType(currentEncoding)) {
      $encoding = currentEncoding;
    }
    loading = false;
  };

  const handleEdit = () => {
    if (editInput) {
      editInput = false;
      input = initialInput;
    } else {
      editInput = true;
      input;
    }
  };
</script>

<div class="flex flex-col gap-1">
  <PayloadDecoder value={payloads} key="payloads" onDecode={setInitialInput}>
    <PayloadInput bind:input bind:encoding bind:loading editing={editInput}>
      <div slot="action" class:hidden={!showEditActions}>
        <Button variant="secondary" on:click={handleEdit}>
          {editInput ? translate('common.cancel') : translate('common.edit')}
        </Button>
      </div>
    </PayloadInput>
  </PayloadDecoder>
</div>
