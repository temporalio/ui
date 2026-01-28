<script lang="ts">
  import { onDestroy } from 'svelte';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import FileInput from '$lib/holocene/file-input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  export let id: string = crypto.randomUUID();
  export let error = false;
  export let input: string;
  export let label = translate('workflows.signal-payload-input-label');
  export let loading = false;
  export let hintText = translate('workflows.signal-payload-input-label-hint');
  export let editing = true;

  $: error = !isValidInput(input);

  const isValidInput = (value: string) => {
    if (!input) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (text: string): void => {
    input = text;
  };

  const clearValues = () => {
    input = '';
    loading = false;
  };

  const onUpload = (uploadInput: string) => {
    input = uploadInput;
  };

  onDestroy(clearValues);
</script>

<div class="flex flex-col gap-2">
  <Label for={id} {label} />
  <div class="flex gap-2">
    {#key [loading, editing]}
      <CodeBlock
        {id}
        maxHeight={320}
        content={input}
        onchange={handleInputChange}
        editable={editing}
        copyable={false}
      />
    {/key}
    {#if editing}
      <Tooltip text={translate('common.upload-json')} topRight>
        <FileInput id="{id}-input-file-upload" {onUpload} />
      </Tooltip>
    {/if}
  </div>
  <span
    class="text-xs {error ? 'text-danger' : 'text-primary'} inline-block"
    class:hidden={!hintText && !error}
    role={error ? 'alert' : null}
  >
    {error ? translate('common.input-valid-json') : hintText}
  </span>
</div>
