<script lang="ts">
  import { onDestroy } from 'svelte';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import FileInput from '$lib/holocene/file-input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    id?: string;
    error?: boolean;
    input: string;
    label?: string;
    loading?: boolean;
    hintText?: string;
    editing?: boolean;
  }

  let {
    id = crypto.randomUUID(),
    error = $bindable(false),
    input = $bindable(),
    label = translate('workflows.signal-payload-input-label'),
    loading = $bindable(false),
    hintText = translate('workflows.signal-payload-input-label-hint'),
    editing = true,
  }: Props = $props();

  const isValidInput = (value: string) => {
    if (!input) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  };

  const computedError = $derived(!isValidInput(input));

  $effect(() => {
    error = computedError;
  });

  const handleInputChange = (text: string): void => {
    if (text !== input) {
      input = text;
    }
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
