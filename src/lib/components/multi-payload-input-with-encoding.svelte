<script lang="ts">
  import type { Writable } from 'svelte/store';

  import type { Snippet } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import Card from '$lib/holocene/card.svelte';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { PayloadInputEncoding } from '$lib/models/payload-encoding';

  import PayloadInput from './payload-input.svelte';

  interface Props {
    inputs: string[];
    encoding: Writable<PayloadInputEncoding>;
    messageType: string;
    error?: boolean;
    label?: string;
    editing?: boolean;
    action?: Snippet;
  }

  let {
    inputs = $bindable(),
    encoding,
    messageType = $bindable(),
    error = $bindable(false),
    label = translate('workflows.input'),
    editing = true,
    action,
  }: Props = $props();

  let nextId = inputs.length;
  let ids = $state(inputs.map((_, i) => i));

  $effect(() => {
    if (ids.length !== inputs.length) {
      ids = inputs.map((_, i) => ids[i] ?? nextId++);
    }
  });

  $effect(() => {
    if ($encoding === 'json/plain' && messageType) {
      messageType = '';
    }
  });

  const addInput = () => {
    inputs = [...inputs, ''];
    ids = [...ids, nextId++];
  };

  const removeInput = (index: number) => {
    inputs = inputs.filter((_, i) => i !== index);
    ids = ids.filter((_, i) => i !== index);
  };
</script>

<div>
  <h5 class="pb-1 text-sm font-medium">{label}</h5>
  <Card class="flex flex-col gap-2">
    {#each inputs as _, index (ids[index])}
      <div class="flex items-start gap-2">
        <div class="grow">
          <PayloadInput
            bind:input={inputs[index]}
            id="input-{index}"
            {editing}
            clearOnDestroy={false}
          />
        </div>
        {#if editing && inputs.length > 1}
          <IconButton
            icon="trash"
            label={translate('workflows.remove-input')}
            data-testid="remove-input-{index}"
            on:click={() => removeInput(index)}
          />
        {/if}
      </div>
    {/each}
    {#if editing}
      <div>
        <Button
          variant="ghost"
          leadingIcon="add"
          data-testid="add-input"
          on:click={addInput}>{translate('workflows.add-input')}</Button
        >
      </div>
    {/if}
    <div
      class="flex items-end gap-2 {editing ? 'justify-between' : 'justify-end'}"
    >
      {#if editing}
        <div class="flex w-full flex-col gap-2">
          <RadioGroup
            description={translate('workflows.encoding')}
            group={encoding}
            name="encoding"
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
