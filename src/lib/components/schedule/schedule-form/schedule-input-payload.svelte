<script lang="ts">
  import type { Writable } from 'svelte/store';

  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import PayloadInputWithEncoding from '$lib/components/payload-input-with-encoding.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    isPayloadInputEncodingType,
    type PayloadInputEncoding,
  } from '$lib/models/payload-encoding';
  import type { Payloads } from '$lib/types';
  import { atob } from '$lib/utilities/atob';

  interface Props {
    input: string;
    editInput: boolean;
    encoding: Writable<PayloadInputEncoding>;
    messageType: string;
    payloads: Payloads;
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

  const setInitialInput = (decodedValue: string): void => {
    initialInput = decodedValue;
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
    }
  };
</script>

<div class="flex flex-col gap-1">
  <PayloadDecoder value={payloads} key="payloads" onDecode={setInitialInput}>
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
  </PayloadDecoder>
</div>
