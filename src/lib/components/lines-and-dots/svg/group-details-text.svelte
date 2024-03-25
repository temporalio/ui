<script lang="ts">
  import { page } from '$app/stores';

  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import type { CombinedAttributes } from '$lib/utilities/format-event-attributes';
  import {
    getCodeBlockValue,
    // getStackTrace,
    shouldDisplayAsExecutionLink,
    shouldDisplayAsTaskQueueLink,
    shouldDisplayChildWorkflowLink,
  } from '$lib/utilities/get-single-attribute-for-event';
  import {
    routeForEventHistory,
    routeForTaskQueue,
  } from '$lib/utilities/route-for';

  import type { GraphConfig } from '../constants';

  import TextLink from './text-link.svelte';
  import Text from './text.svelte';

  const { workflow, namespace } = $page.params;

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let point: [number, number] = [0, 0];
  export let config: GraphConfig;
  export let canvasWidth: number;

  const { fontSizeRatio } = config;

  $: [x, y] = point;
  $: codeBlockValue = getCodeBlockValue(value);
  // $: stackTrace = getStackTrace(codeBlockValue);
</script>

{#if typeof value === 'object'}
  {#if value?.payloads}
    <PayloadDecoder {value} key="payloads" let:decodedValue>
      {#key decodedValue}
        <foreignObject
          {x}
          y={y - fontSizeRatio}
          width={canvasWidth - 280}
          height={2 * fontSizeRatio}
        >
          <div class="overflow-auto" style="height: {2 * fontSizeRatio}px">
            <CodeBlock inline content={decodedValue} />
          </div>
        </foreignObject>
        <!-- <Text  position="middle" {point} category="pending">
          {decodedValue.slice(1, -1)}
        </Text> -->
      {/key}
    </PayloadDecoder>
  {:else if key === 'searchAttributes'}
    <PayloadDecoder
      key="searchAttributes"
      value={{ searchAttributes: codeBlockValue }}
      let:decodedValue
    >
      {#key decodedValue}
        <foreignObject
          {x}
          y={y - fontSizeRatio}
          width={canvasWidth - 280}
          height={2 * fontSizeRatio}
        >
          <div class="overflow-auto" style="height: {2 * fontSizeRatio}px">
            <CodeBlock inline content={decodedValue} />
          </div>
        </foreignObject>

        <!-- <Text  position="middle" {point} category="pending">
          {decodedValue}
        </Text> -->
      {/key}
    </PayloadDecoder>
  {:else}
    <PayloadDecoder value={codeBlockValue} let:decodedValue>
      {#key decodedValue}
        <foreignObject
          {x}
          y={y - fontSizeRatio}
          width={canvasWidth - 280}
          height={2 * fontSizeRatio}
        >
          <div class="overflow-auto" style="height: {2 * fontSizeRatio}px">
            <CodeBlock inline content={decodedValue} />
          </div>
        </foreignObject>
        <!-- <Text  position="middle" {point} category="pending"
          >{decodedValue}</Text
        > -->
      {/key}
    </PayloadDecoder>
  {/if}
  <!-- {#if stackTrace}
    {stackTrace}
  {/if} -->
{:else if shouldDisplayAsExecutionLink(key)}
  <TextLink
    href={routeForEventHistory({
      namespace,
      workflow,
      run: value,
    })}
    {point}>{value}</TextLink
  >
{:else if shouldDisplayChildWorkflowLink(key, attributes)}
  <TextLink
    href={routeForEventHistory({
      namespace: attributes?.namespace || namespace,
      workflow: attributes.workflowExecutionWorkflowId,
      run: attributes.workflowExecutionRunId,
    })}
    {point}>{value}</TextLink
  >
  >
{:else if shouldDisplayAsTaskQueueLink(key)}
  <TextLink href={routeForTaskQueue({ namespace, queue: value })} {point}
    >{value}</TextLink
  >
{:else}
  <Text {point}>{value}</Text>
{/if}
