<script context="module" lang="ts">
  export type PayloadInputEncoding = 'json/plain' | 'json/protobuf';
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

  let codeBlock: CodeBlock;
  let uploaded = false;

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
    uploaded = false;
  };

  const onUpload = (uploadInput: string) => {
    input = uploadInput;
    uploaded = true;
  };

  onDestroy(() => {
    clearValues();
  });
</script>

<div class="flex items-center justify-between">
  <h5>Input</h5>
  <span class="text-xs font-light italic">
    {translate('workflows.signal-payload-input-label-hint')}
  </span>
</div>
<Card class="flex flex-col gap-2">
  <div class="flex items-center justify-between">
    <RadioGroup description={'Encoding'} bind:group={encoding} name="encoding">
      <RadioInput id="json/plain" value="json/plain" label="json/plain" />
      <RadioInput
        id="json/protobuf"
        value="json/protobuf"
        label="json/protobuf"
      />
    </RadioGroup>
    <Tooltip text={translate('common.upload-json')} left>
      <FileInput id="start-workflow-input-file-upload" {onUpload} />
    </Tooltip>
  </div>
  <div class="flex flex-col gap-2">
    <Label
      for="payload-input"
      label={translate('workflows.signal-payload-input-label')}
    />
    {#key uploaded}
      <CodeBlock
        id="payload-input"
        maxHeight={320}
        content={input}
        on:change={handleInputChange}
        editable
        copyable={false}
        bind:this={codeBlock}
      />
    {/key}
    {#if error}
      <Alert intent="error" title={translate('common.input-valid-json')} />
    {/if}
  </div>
</Card>
