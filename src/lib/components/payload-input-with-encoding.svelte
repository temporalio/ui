<script context="module" lang="ts">
  const encoding = ['json/plain', 'json/protobuf'] as const;
  export type PayloadInputEncoding = (typeof encoding)[number];
  export const isPayloadInputEncodingType = (
    x: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ): x is PayloadInputEncoding => encoding.includes(x);
</script>

<script lang="ts">
  import { type Writable } from 'svelte/store';

  import { onDestroy } from 'svelte';

  import Card from '$lib/holocene/card.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';

  import PayloadInput from './payload-input.svelte';

  export let input: string;
  export let encoding: Writable<PayloadInputEncoding>;
  export let error = false;
  export let resetValues = false;
  export let loading = false;

  $: {
    if (resetValues) {
      clearValues();
    }
  }

  const clearValues = () => {
    $encoding = 'json/plain';
  };

  onDestroy(() => {
    clearValues();
  });
</script>

<div>
  <h5 class="pb-1 text-sm font-medium">{translate('workflows.input')}</h5>
  <Card class="flex flex-col gap-2">
    <PayloadInput bind:input bind:loading {error} />
    <div class="flex items-end justify-between">
      <RadioGroup
        description={translate('workflows.encoding')}
        bind:group={encoding}
        name="encoding"
      >
        <RadioInput id="json/plain" value="json/plain" label="json/plain" />
        <RadioInput
          id="json/protobuf"
          value="json/protobuf"
          label="json/protobuf"
        />
      </RadioGroup>
    </div>
  </Card>
</div>
