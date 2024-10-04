<script lang="ts">
  import { onDestroy } from 'svelte';

  import Alert from '$lib/holocene/alert.svelte';
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { translate } from '$lib/i18n/translate';

  export let input: string;
  export let encoding: string;
  export let error = false;
  export let resetValues = false;

  let codeBlock: CodeBlock;

  const handleInputChange = (event: CustomEvent<string>): void => {
    input = event.detail;
  };

  const isValidInput = (value: string) => {
    if (!input) {
      return true;
    }

    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  };

  $: error = !isValidInput(input);

  const clearValues = () => {
    encoding = 'json/plain';
    input = '';
    codeBlock?.resetView(input);
    input = '';
  };

  $: {
    if (resetValues) {
      clearValues();
    }
  }

  onDestroy(() => {
    clearValues();
  });
</script>

<h5>Input</h5>
<Card class="flex flex-col gap-2">
  <div class="flex items-end gap-2">
    <Input
      id="payload-encoding"
      label="Encoding"
      class="w-full"
      required
      bind:value={encoding}
    />
    <slot />
  </div>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-1">
      <Label
        for="payload-input"
        label={translate('workflows.signal-payload-input-label')}
      />
      <span class="text-xs font-light italic">
        {translate('workflows.signal-payload-input-label-hint')}
      </span>
    </div>
    <CodeBlock
      id="payload-input"
      maxHeight={320}
      content={input}
      on:change={handleInputChange}
      editable
      copyable={false}
      bind:this={codeBlock}
    />
    {#if error}
      <Alert intent="error" title={translate('common.input-valid-json')} />
    {/if}
  </div>
</Card>
