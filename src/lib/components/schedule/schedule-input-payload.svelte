<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Payloads } from '$lib/types';
  import { atob } from '$lib/utilities/atob';
  import { getSinglePayload } from '$lib/utilities/encode-payload';

  import PayloadDecoder from '../event/payload-decoder.svelte';
  import PayloadInputWithEncoding, {
    isPayloadInputEncodingType,
    type PayloadInputEncoding,
  } from '../payload-input-with-encoding.svelte';

  export let input: string;
  export let editInput: boolean;
  export let encoding: Writable<PayloadInputEncoding>;
  export let messageType: string;
  export let payloads: Payloads;
  export let showEditActions: boolean = false;

  console.log('Payloads: ', payloads);
  let initialInput = '';
  let initialEncoding: PayloadInputEncoding = 'json/plain';
  let initialMessageType = '';
  let loading = true;

  const setInitialInput = (decodedValue: string): void => {
    initialInput = getSinglePayload(decodedValue);
    input = initialInput;
    const currentEncoding = atob(
      String(payloads?.payloads[0]?.metadata?.encoding ?? 'json/plain'),
    );
    const currentMessageType = payloads?.payloads[0]?.metadata?.messageType
      ? atob(String(payloads?.payloads[0]?.metadata?.messageType))
      : '';

    if (isPayloadInputEncodingType(currentEncoding)) {
      $encoding = currentEncoding;
      initialEncoding = $encoding;
      if (currentEncoding === 'json/protobuf' && currentMessageType) {
        messageType = currentMessageType;
        initialMessageType = currentMessageType;
      }
    }
    loading = false;
  };

  const handleEdit = () => {
    if (editInput) {
      editInput = false;
      input = initialInput;
      $encoding = initialEncoding;
      messageType = initialMessageType;
    } else {
      editInput = true;
      input;
    }
  };
</script>

<div class="flex flex-col gap-1">
  <PayloadDecoder value={payloads} key="payloads" onDecode={setInitialInput}>
    <PayloadInputWithEncoding
      bind:input
      bind:encoding
      bind:messageType
      bind:loading
      editing={editInput}
      id="schedule-payload-input"
    >
      <div slot="action" class:hidden={!showEditActions}>
        <Button variant="secondary" on:click={handleEdit}>
          {editInput ? translate('common.cancel') : translate('common.edit')}
        </Button>
      </div>
    </PayloadInputWithEncoding>
  </PayloadDecoder>
</div>
