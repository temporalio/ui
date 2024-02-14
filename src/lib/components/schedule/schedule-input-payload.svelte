<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import { dataEncoder } from '$lib/stores/data-encoder';

  const getDefaultSignalInput = () =>
    $dataEncoder.endpoint ? '{"metadata": {"encoding": ""}, "data": ""}' : '';

  export let input = getDefaultSignalInput();

  let signalInputCodeBlock: CodeBlock;

  const handleSignalInputChange = (event: CustomEvent<string>) => {
    input = event.detail;
  };

  // const clearInput = () => {
  //   input = getDefaultSignalInput();
  //   signalInputCodeBlock?.resetView(input);
  // };
</script>

<div class="flex flex-col gap-4">
  <label for="schedule-input">{translate('workflows.input')}</label>
  <CodeBlock
    id="schedule-input"
    class="max-h-80 overflow-y-scroll overscroll-contain"
    content={input}
    on:change={handleSignalInputChange}
    editable
    copyable={false}
    bind:this={signalInputCodeBlock}
  />
  <span class="font-secondary text-xs font-light italic">
    {translate('workflows.signal-payload-input-label-hint')}
  </span>
</div>

<style lang="postcss">
  .error {
    @apply border-2 border-red-500;
  }
</style>
