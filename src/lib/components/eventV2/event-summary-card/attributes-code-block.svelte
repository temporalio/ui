<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { getCodeBlockValueWithoutNullPayloads } from '$lib/utilities/get-single-attribute-for-event';
  import { getAttributePayloads } from '../event-detail-keys';
  import type { ProtoFailure } from '$types';
  import { format } from '$lib/utilities/format-camel-case';

  export let event: IterableEvent;
  $: payloadAttributes = getAttributePayloads(event.attributes);
  const getFailureMessage = (failure: ProtoFailure) =>
    failure?.cause?.cause?.message ??
    failure?.cause?.message ??
    failure?.message;
</script>

<div
  class="overflow-x-hidden w-1/2 bg-gray-900 flex flex-row gap-2 rounded-tr-xl rounded-br-xl"
>
  {#each payloadAttributes as attribute}
    {@const isFailure = attribute.key === 'failure'}
    {@const codeBlockValue = isFailure
      ? getFailureMessage(attribute.value)
      : getCodeBlockValueWithoutNullPayloads(attribute.value)}
    {#if codeBlockValue}
      <div class="grow overflow-auto">
        <CodeBlock
          inline
          icon={isFailure ? 'warning' : 'json'}
          title={format(attribute.key)}
          content={codeBlockValue}
          titleColor={isFailure ? 'text-red-400' : 'text-white'}
        />
      </div>
    {/if}
  {/each}
</div>

<!-- <div class:code-with-stack-trace={stackTrace}>
  <div class="flex flex-col {stackTrace ? 'lg:w-1/2' : ''}">
    <CodeBlock
      {content}
      title="Results"
      unroundTitle
      icon="json"
      class="h-auto {stackTrace ? 'mb-2' : ''}"
    />
  </div>
  {#if stackTrace}
    <div class="flex flex-col lg:w-1/2">
      <p class="text-sm">Stack trace</p>
      <CodeBlock
        content={stackTrace}
        title="Stack Trace"
        unroundTitle
        class="mb-2 h-full lg:pr-2"
        language="text"
      />
    </div>
  {/if}
</div> -->
