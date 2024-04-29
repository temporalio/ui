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
  // export let value: string | Record<string, unknown>;
  export let attributes: CombinedAttributes;
  export let point: [number, number] = [0, 0];
  export let width: number;

  let value = {
    id: '5',
    name: 'Marker: Version',
    events: {},
    eventIds: {},
    initialEvent: {
      eventId: '5',
      eventTime: '2022-07-01T20:20:50.175413503Z',
      eventType: 'MarkerRecorded',
      version: '0',
      taskId: '29875719',
      markerRecordedEventAttributes: {
        markerName: 'Version',
        details: {
          'change-id': {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'ImluaXRpYWwgdmVyc2lvbiI=',
              },
            ],
          },
          version: {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'Mw==',
              },
            ],
          },
        },
        workflowTaskCompletedEventId: '4',
        header: null,
        failure: null,
      },
      attributes: {
        type: 'markerRecordedEventAttributes',
        markerName: 'Version',
        details: {
          'change-id': {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'ImluaXRpYWwgdmVyc2lvbiI=',
              },
            ],
          },
          version: {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'Mw==',
              },
            ],
          },
        },
        workflowTaskCompletedEventId: '4',
        header: null,
        failure: null,
      },
      category: 'marker',
      id: '5',
      name: 'MarkerRecorded',
      timestamp: '2022-07-01 UTC 20:20:50.17',
    },
    timestamp: '2022-07-01 UTC 20:20:50.17',
    category: 'marker',
    eventTime: '2022-07-01T20:20:50.175413503Z',
    attributes: {
      type: 'markerRecordedEventAttributes',
      markerName: 'Version',
      details: {
        'change-id': {
          payloads: [
            {
              metadata: {
                encoding: 'anNvbi9wbGFpbg==',
              },
              data: 'ImluaXRpYWwgdmVyc2lvbiI=',
            },
          ],
        },
        version: {
          payloads: [
            {
              metadata: {
                encoding: 'anNvbi9wbGFpbg==',
              },
              data: 'Mw==',
            },
          ],
        },
      },
      workflowTaskCompletedEventId: '4',
      header: null,
      failure: null,
    },
    eventList: [
      {
        eventId: '5',
        eventTime: '2022-07-01T20:20:50.175413503Z',
        eventType: 'MarkerRecorded',
        version: '0',
        taskId: '29875719',
        markerRecordedEventAttributes: {
          markerName: 'Version',
          details: {
            'change-id': {
              payloads: [
                {
                  metadata: {
                    encoding: 'anNvbi9wbGFpbg==',
                  },
                  data: 'ImluaXRpYWwgdmVyc2lvbiI=',
                },
              ],
            },
            version: {
              payloads: [
                {
                  metadata: {
                    encoding: 'anNvbi9wbGFpbg==',
                  },
                  data: 'Mw==',
                },
              ],
            },
          },
          workflowTaskCompletedEventId: '4',
          header: null,
          failure: null,
        },
        attributes: {
          type: 'markerRecordedEventAttributes',
          markerName: 'Version',
          details: {
            'change-id': {
              payloads: [
                {
                  metadata: {
                    encoding: 'anNvbi9wbGFpbg==',
                  },
                  data: 'ImluaXRpYWwgdmVyc2lvbiI=',
                },
              ],
            },
            version: {
              payloads: [
                {
                  metadata: {
                    encoding: 'anNvbi9wbGFpbg==',
                  },
                  data: 'Mw==',
                },
              ],
            },
          },
          workflowTaskCompletedEventId: '4',
          header: null,
          failure: null,
        },
        category: 'marker',
        id: '5',
        name: 'MarkerRecorded',
        timestamp: '2022-07-01 UTC 20:20:50.17',
      },
    ],
    lastEvent: {
      eventId: '5',
      eventTime: '2022-07-01T20:20:50.175413503Z',
      eventType: 'MarkerRecorded',
      version: '0',
      taskId: '29875719',
      markerRecordedEventAttributes: {
        markerName: 'Version',
        details: {
          'change-id': {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'ImluaXRpYWwgdmVyc2lvbiI=',
              },
            ],
          },
          version: {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'Mw==',
              },
            ],
          },
        },
        workflowTaskCompletedEventId: '4',
        header: null,
        failure: null,
      },
      attributes: {
        type: 'markerRecordedEventAttributes',
        markerName: 'Version',
        details: {
          'change-id': {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'ImluaXRpYWwgdmVyc2lvbiI=',
              },
            ],
          },
          version: {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'Mw==',
              },
            ],
          },
        },
        workflowTaskCompletedEventId: '4',
        header: null,
        failure: null,
      },
      category: 'marker',
      id: '5',
      name: 'MarkerRecorded',
      timestamp: '2022-07-01 UTC 20:20:50.17',
    },
    isFailureOrTimedOut: false,
    isCanceled: false,
    isTerminated: false,
  };
  const { fontSizeRatio } = DetailsConfig;

  let hovering = false;

  $: [x, y] = point;
  $: codeBlockValue = getCodeBlockValue(value);
  $: maxHeight = hovering
    ? 3 * staticCodeBlockHeight
    : staticCodeBlockHeight - fontSizeRatio;
</script>

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
          id={hovering ? 'hover' : ''}
          on:mouseenter={() => (hovering = true)}
          on:mouseleave={() => (hovering = false)}
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
          id={hovering ? 'hover' : ''}
          on:mouseenter={() => (hovering = true)}
          on:mouseleave={() => (hovering = false)}
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
          id={hovering ? 'hover' : ''}
          on:mouseenter={() => (hovering = true)}
          on:mouseleave={() => (hovering = false)}
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
