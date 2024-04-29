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
  export let onHover: (key: string) => void | undefined = undefined;
  export let active = true;

  const { fontSizeRatio } = DetailsConfig;

  $: [x, y] = point;
  $: codeBlockValue = getCodeBlockValue(value);
  $: maxHeight = active
    ? 3 * staticCodeBlockHeight
    : staticCodeBlockHeight - fontSizeRatio;
</script>

{#key active}
  {#if typeof value === 'object'}
    {#if value?.payloads}
      <PayloadDecoder {value} key="payloads" let:decodedValue>
        {#key decodedValue}
          <foreignObject
            role="note"
            {x}
            y={y - fontSizeRatio}
            {width}
            height={maxHeight}
            opacity="1"
            on:mouseenter={() => onHover(key)}
            on:mouseleave={() => onHover('')}
          >
            <CodeBlock content={decodedValue} {maxHeight} />
          </foreignObject>
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
            role="note"
            {x}
            y={y - fontSizeRatio}
            {width}
            height={maxHeight}
            opacity="1"
            on:mouseenter={() => onHover(key)}
            on:mouseleave={() => onHover('')}
          >
            <CodeBlock content={decodedValue} {maxHeight} />
          </foreignObject>
        {/key}
      </PayloadDecoder>
    {:else}
      <PayloadDecoder value={codeBlockValue} let:decodedValue>
        {#key decodedValue}
          <foreignObject
            role="note"
            {x}
            y={y - fontSizeRatio}
            {width}
            height={maxHeight}
            opacity="1"
            on:mouseenter={() => onHover(key)}
            on:mouseleave={() => onHover('')}
          >
            <CodeBlock content={decodedValue} {maxHeight} />
          </foreignObject>
        {/key}
      </PayloadDecoder>
    {/if}
    <!-- {#if stackTrace}
    {stackTrace}
  {/if} -->
  {:else if shouldDisplayAsExecutionLink(key)}
    <Link
      inverse
      href={routeForEventHistory({
        namespace,
        workflow,
        run: value,
      })}>{value}</Link
    >
  {:else if shouldDisplayChildWorkflowLink(key, attributes)}
    <Link
      inverse
      href={routeForEventHistory({
        namespace: attributes?.namespace || namespace,
        workflow: attributes.workflowExecutionWorkflowId,
        run: attributes.workflowExecutionRunId,
      })}>{value}</Link
    >
  {:else if shouldDisplayAsTaskQueueLink(key)}
    <Link inverse href={routeForTaskQueue({ namespace, queue: value })}
      >{value}</Link
    >
  {:else}
    {value}
  {/if}
{/key}
