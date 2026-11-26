<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { Failure, Payload } from '$lib/types';

  interface Props {
    input?: Payload;
    result?: Payload;
    failure?: Failure;
    isPending?: boolean;
  }

  let { input, result, failure, isPending = false }: Props = $props();

  const inputLabel = translate('standalone-nexus-operations.operation-input');
  const resultLabel = translate('standalone-nexus-operations.operation-result');
</script>

<div class="grid w-full grid-cols-2 gap-4 max-md:grid-cols-1">
  <div class="flex flex-col gap-2">
    <h5>Input</h5>
    {#if input}
      <PayloadCodeBlock value={input} label={inputLabel} />
    {:else}
      <CodeBlock
        content="null"
        label={inputLabel}
        language="text"
        copyable={false}
      />
    {/if}
  </div>
  <div class="flex flex-col gap-2">
    <h5>Result</h5>
    {#if failure}
      <CodeBlock
        content={JSON.stringify(failure, null, 2)}
        label={resultLabel}
      />
    {:else if result}
      <PayloadCodeBlock value={result} label={resultLabel} />
    {:else}
      <CodeBlock
        content={isPending
          ? translate('standalone-nexus-operations.results-pending')
          : 'null'}
        label={resultLabel}
        language="text"
        copyable={false}
      />
    {/if}
  </div>
</div>
