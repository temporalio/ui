<script lang="ts">
  import type { Writable } from 'svelte/store';

  import PayloadDecoder from '$lib/components/payload/payload-decoder.svelte';
  import PayloadInputWithEncoding from '$lib/components/payload-input-with-encoding.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    isPayloadInputEncodingType,
    type PayloadInputEncoding,
  } from '$lib/models/payload-encoding';
  import type { Payloads } from '$lib/types';
  import { base64ParsePayloadMetadata } from '$lib/utilities/decode-payload';

  interface Props {
    input: string;
    editInput: boolean;
    encoding: Writable<PayloadInputEncoding>;
    messageType: string;
    payloads: Payloads | undefined;
    showEditActions?: boolean;
  }

  let {
    input = $bindable(),
    editInput = $bindable(),
    encoding,
    messageType = $bindable(),
    payloads,
    showEditActions = false,
  }: Props = $props();

  let initialInput = $state('');
  let initialEncoding = $state<PayloadInputEncoding>('json/plain');
  let initialMessageType = $state('');
  let loading = $state(true);

  const setInitialInput = (decodedValue: string[]): void => {
    initialInput = decodedValue[0];
    input = initialInput;
    let currentEncoding: PayloadInputEncoding = 'json/plain';
    let currentMessageType = '';

    if (payloads) {
      const parsedMetadata = base64ParsePayloadMetadata(payloads);

      currentEncoding =
        (parsedMetadata[0]?.encoding as PayloadInputEncoding) ?? 'json/plain';
      currentMessageType = parsedMetadata[0]?.messageType ?? '';
    }

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
    }
  };
</script>

<div class="flex flex-col gap-1">
  <PayloadDecoder value={payloads} onDecode={setInitialInput}>
    {#snippet children(_decodedValue)}
      <PayloadInputWithEncoding
        bind:input
        {encoding}
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
    {/snippet}
  </PayloadDecoder>
</div>
