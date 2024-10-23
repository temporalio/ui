<script lang="ts">
  import { onDestroy } from 'svelte';
  import { v4 } from 'uuid';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import FileInput from '$lib/holocene/file-input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  export let id = v4();
  export let error = false;
  export let input: string;
  export let label = translate('workflows.signal-payload-input-label');
  export let loading = false;
  export let resetValues = false;
  export let hintText = translate('workflows.signal-payload-input-label-hint');

  let codeBlock: CodeBlock;

  $: error = !isValidInput(input);

  $: {
    if (resetValues) {
      clearValues();
    }
  }

  const isValidInput = (value: string) => {
    if (!input) return true;
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleInputChange = (event: CustomEvent<string>): void => {
    input = event.detail;
  };

  const clearValues = () => {
    input = '';
    codeBlock?.resetView(input);
    loading = false;
  };

  const onUpload = (uploadInput: string) => {
    input = uploadInput;
    codeBlock?.resetView(input);
  };

  onDestroy(() => {
    clearValues();
  });
</script>

<div class="flex flex-col gap-2">
  <Label for={id} {label} />
  <div class="flex gap-2">
    {#key loading}
      <CodeBlock
        {id}
        maxHeight={320}
        content={input}
        on:change={handleInputChange}
        editable
        copyable={false}
        bind:this={codeBlock}
      />
    {/key}
    <Tooltip text={translate('common.upload-json')} topRight>
      <FileInput id="{id}-input-file-upload" {onUpload} />
    </Tooltip>
  </div>
  <span
    class="text-xs {error ? 'text-danger' : 'text-primary'} inline-block"
    class:hidden={!hintText && !error}
    role={error ? 'alert' : null}
  >
    {error ? translate('common.input-valid-json') : hintText}
  </span>
</div>
