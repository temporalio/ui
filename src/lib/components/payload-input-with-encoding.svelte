<script lang="ts">
  import type { Writable } from 'svelte/store';

  import type { Snippet } from 'svelte';

  import Card from '$lib/holocene/card.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { PayloadInputEncoding } from '$lib/models/payload-encoding';

  import PayloadInput from './payload-input.svelte';

  interface Props {
    id?: string;
    input: string;
    encoding: Writable<PayloadInputEncoding>;
    messageType: string;
    error?: boolean;
    loading?: boolean;
    label?: string;
    editing?: boolean;
    hintText?: string;
    placeholder?: string;
    payloadLabel?: string;
    copyable?: boolean;
    action?: Snippet;
  }

  const uid = $props.id();

  let {
    id = uid,
    input = $bindable(),
    encoding = $bindable(),
    messageType = $bindable(),
    error = false,
    loading = $bindable(false),
    label = translate('workflows.input'),
    editing = true,
    hintText,
    placeholder,
    payloadLabel,
    copyable = false,
    action,
  }: Props = $props();

  $effect(() => {
    if ($encoding === 'json/plain' && messageType) {
      messageType = '';
    }
  });
</script>

<div>
  <p class="pb-1 text-sm font-medium">{label}</p>
  <Card class="flex flex-col gap-4">
    <PayloadInput
      bind:input
      bind:loading
      {error}
      {id}
      {editing}
      {placeholder}
      label={payloadLabel}
      {hintText}
      {copyable}
    />
    <div
      class="flex items-end gap-2 {editing ? 'justify-between' : 'justify-end'}"
    >
      {#if editing}
        <div class="flex w-full flex-col gap-2">
          <RadioGroup
            description={translate('workflows.encoding')}
            group={encoding}
            name="encoding"
            class="p-0"
          >
            <RadioInput id="json/plain" value="json/plain" label="json/plain" />
            <RadioInput
              id="json/protobuf"
              value="json/protobuf"
              label="json/protobuf"
            />
          </RadioGroup>
          {#if $encoding === 'json/protobuf'}
            <Input
              label={translate('workflows.message-type')}
              bind:value={messageType}
              {error}
              id="messageType"
            />
          {/if}
        </div>
      {/if}
      {@render action?.()}
    </div>
  </Card>
</div>
