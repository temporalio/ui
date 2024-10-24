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

  import Alert from '$lib/holocene/alert.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import FileInput from '$lib/holocene/file-input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  export let input: string;
  export let encoding: Writable<PayloadInputEncoding>;
  export let error = false;
  export let resetValues = false;
  export let loading = false;
  export let editing = true;

  let codeBlock: CodeBlock;

  $: error = !isValidInput(input);

  $: {
    if (resetValues) {
      clearValues();
    }
  }

  const handleInputChange = (event: CustomEvent<string>): void => {
    input = event.detail;
  };

  const isValidInput = (value: string) => {
    if (!input) return true;
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  const clearValues = () => {
    $encoding = 'json/plain';
    input = '';
    codeBlock?.resetView(input);
    loading = false;
  };

  const onUpload = (uploadInput: string) => {
    input = uploadInput;
    loading = true;
  };

  onDestroy(() => {
    clearValues();
  });
</script>

<div class="flex items-center justify-between">
  <h5>{translate('workflows.input')}</h5>
  <span class="text-xs font-light italic">
    {translate('workflows.signal-payload-input-label-hint')}
  </span>
</div>
<Card class="flex flex-col gap-2">
  <div class="flex flex-col gap-2">
    <Label
      for="payload-input"
      label={translate('workflows.signal-payload-input-label')}
    />
    <div class="flex gap-2">
      {#key [loading, editing]}
        <CodeBlock
          id="payload-input"
          maxHeight={320}
          content={input}
          on:change={handleInputChange}
          editable={editing}
          copyable={false}
          bind:this={codeBlock}
        />
      {/key}
      {#if editing}
        <Tooltip text={translate('common.upload-json')} topRight>
          <FileInput id="start-workflow-input-file-upload" {onUpload} />
        </Tooltip>
      {/if}
    </div>
    {#if error}
      <Alert intent="error" title={translate('common.input-valid-json')} />
    {/if}
  </div>
  <div class="flex items-end {editing ? 'justify-between' : 'justify-end'}">
    {#if editing}
      <RadioGroup
        description={'Encoding'}
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
    {/if}
    <slot name="action" />
  </div>
</Card>
