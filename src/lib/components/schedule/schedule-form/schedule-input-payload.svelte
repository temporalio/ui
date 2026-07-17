<script lang="ts">
  import { get, type Writable, writable } from 'svelte/store';

  import PayloadDecoder, {
    type DecodedPayloadResult,
  } from '$lib/components/payload/payload-decoder.svelte';
  import PayloadInputWithEncoding from '$lib/components/payload-input-with-encoding.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    isPayloadInputEncodingType,
    type PayloadInputEncoding,
  } from '$lib/models/payload-encoding';
  import type { Payloads } from '$lib/types';
  import {
    base64ParsePayloadMetadata,
    isParsedPayload,
  } from '$lib/utilities/decode-payload';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  interface Props {
    input: string;
    editInput: boolean;
    encoding?: PayloadInputEncoding;
    messageType: string;
    payloads: Payloads | undefined;
    showEditActions?: boolean;
  }

  let {
    input = $bindable(),
    editInput = $bindable(),
    encoding = $bindable('json/plain'),
    messageType = $bindable(),
    payloads,
    showEditActions = false,
  }: Props = $props();

  const encodingStore: Writable<PayloadInputEncoding> = writable(encoding);
  $effect(() => {
    if (get(encodingStore) !== encoding) encodingStore.set(encoding);
  });
  $effect(() => {
    const val = $encodingStore;
    if (val !== encoding) encoding = val;
  });

  let initialInput = $state('');
  let initialEncoding = $state<PayloadInputEncoding>('json/plain');
  let initialMessageType = $state('');
  let loading = $state(true);

  const setInitialInput = (result: DecodedPayloadResult): void => {
    if (result && result[0] && isParsedPayload(result[0].decodedValue)) {
      initialInput = stringifyWithBigInt(result[0].decodedValue.data) ?? '';

      input = initialInput;
      let currentEncoding: PayloadInputEncoding = 'json/plain';
      let currentMessageType = '';

      if (payloads) {
        const parsedMetadata = base64ParsePayloadMetadata(payloads);

        currentEncoding =
          (parsedMetadata?.[0]?.encoding as PayloadInputEncoding) ??
          'json/plain';
        currentMessageType = parsedMetadata?.[0]?.messageType ?? '';
      }

      if (isPayloadInputEncodingType(currentEncoding)) {
        encoding = currentEncoding;
        initialEncoding = encoding;
        if (currentEncoding === 'json/protobuf' && currentMessageType) {
          messageType = currentMessageType;
          initialMessageType = currentMessageType;
        }
      }
    }

    loading = false;
  };

  const handleEdit = () => {
    if (editInput) {
      editInput = false;
      input = initialInput;
      encoding = initialEncoding;
      messageType = initialMessageType;
    } else {
      editInput = true;
    }
  };
</script>

<div class="flex flex-col gap-1">
  <PayloadDecoder value={payloads ?? {}} onDecode={setInitialInput}>
    {#snippet children(_decodedValue)}
      <PayloadInputWithEncoding
        bind:input
        encoding={encodingStore}
        bind:messageType
        bind:loading
        editing={editInput}
        payloadLabel="JSON Data"
        placeholder={'{"key": "value"}'}
        id="schedule-payload-input"
        copyable={true}
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
