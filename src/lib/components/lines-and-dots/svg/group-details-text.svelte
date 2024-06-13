<script lang="ts">
  import { page } from '$app/stores';

  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
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

  import { DetailsConfig, staticCodeBlockHeight } from '../constants';

  const { workflow, namespace } = $page.params;

  export let key: string;
  export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let point: [number, number] = [0, 0];
  export let width: number;

  const { fontSizeRatio } = DetailsConfig;

  $: [x, y] = point;
  $: codeBlockValue = getCodeBlockValue(value);
</script>

{#if typeof value === 'object'}
  {#if value?.payloads}
    <PayloadDecoder {value} key="payloads" let:decodedValue>
      {#key decodedValue}
        <foreignObject
          {x}
          y={y - fontSizeRatio}
          {width}
          height={staticCodeBlockHeight - fontSizeRatio}
        >
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
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
          {width}
          height={staticCodeBlockHeight - fontSizeRatio}
        >
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
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
          {width}
          height={staticCodeBlockHeight - fontSizeRatio}
        >
          <CodeBlock
            content={decodedValue}
            maxHeight={staticCodeBlockHeight - fontSizeRatio}
          />
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
  <Link
    light
    href={routeForEventHistory({
      namespace,
      workflow,
      run: value,
    })}>{value}</Link
  >
{:else if shouldDisplayChildWorkflowLink(key, attributes)}
  <Link
    light
    href={routeForEventHistory({
      namespace: attributes?.namespace || namespace,
      workflow: attributes.workflowExecutionWorkflowId,
      run: attributes.workflowExecutionRunId,
    })}>{value}</Link
  >
{:else if shouldDisplayAsTaskQueueLink(key)}
  <Link light href={routeForTaskQueue({ namespace, queue: value })}
    >{value}</Link
  >
{:else}
  {value}
{/if}
