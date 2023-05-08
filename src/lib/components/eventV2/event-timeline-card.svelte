<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { timeFormat } from '$lib/stores/time-format';
  import type { ProtoFailure } from '$lib/types';
  import { capitalize } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { getCodeBlockValueWithoutNullPayloads } from '$lib/utilities/get-single-attribute-for-event';
  import { getAttributePayloads } from './event-detail-keys';
  import AttributesCodeBlock from './event-summary-card/attributes-code-block.svelte';
  import EventClassification from './event-summary-card/event-classification.svelte';
  import { format } from '$lib/utilities/format-camel-case';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  export let group: EventGroup;

  const denyKeys = [
    'activityId',
    'timerId',
    'eventTime',
    'binaryChecksum',
    'scheduledEventId',
    'startedEventId',
    'workflowTaskCompletedEventId',
  ];

  const getEventDetails = (event) => {
    const attributes = formatAttributes(event, { compact: false });
    const eventDetails = Object.entries(attributes);
    const finalDetails = eventDetails.filter(([key, value]) => {
      return !denyKeys.includes(key) && typeof value !== 'object' && value;
    });
    return finalDetails;
  };

  const getPayloadAttributes = (event) =>
    getAttributePayloads(event.attributes);
  const getFailureMessage = (failure: ProtoFailure) =>
    failure?.cause?.cause?.message ??
    failure?.cause?.message ??
    failure?.message;
</script>

<div class="h-auto text-white w-full">
  <div class="flex h-full">
    <div
      class="w-1/2 flex flex-col gap-4 bg-blueGray-800 border-r border-blueGray-800 p-4 h-full"
    >
      <div class="flex items-center gap-2">
        <span class="time text-[12px]">{group.lastEvent.id}</span>
        <h3 class="text-base">{capitalize(group.lastEvent.category)}</h3>
      </div>
      <div class="flex flex-col gap-2">
        {#each group.eventList as event (event.id)}
          <div class="flex items-center gap-1 border-b border-gray-700 my-2">
            <span class="time text-[12px]">{event.id}</span>
            <h3 class="font-medium text-base">{event.name}</h3>
          </div>
          <div
            class="flex items-center justify-between border-b border-gray-700"
          >
            <p class="">Event Time</p>
            <p class="">{formatDate(event.eventTime, $timeFormat)}</p>
          </div>
          {#each getEventDetails(event) as [key, value] (key)}
            <div
              class="flex items-center justify-between border-b border-gray-700"
            >
              <p class="">{key}</p>
              <p class="">{value}</p>
            </div>
          {/each}
        {/each}
      </div>
    </div>
    <div class="w-1/2 flex flex-col gap-4 bg-gray-900 p-4">
      <div class="flex items-center gap-2">
        <Icon name="json" />
        <ul class="tabs">
          <li>
            <input id="tab1" type="radio" name="tabs" />
            <label class="flex gap-2" for="tab1">Input</label>
            <div id="tab-panel-input" class="tab-panel">
              {#each getPayloadAttributes(group.initialEvent) as attribute}
                {@const isFailure = attribute.key === 'failure'}
                {@const codeBlockValue = isFailure
                  ? getFailureMessage(attribute.value)
                  : getCodeBlockValueWithoutNullPayloads(attribute.value)}
                {#if codeBlockValue}
                  <div class="h-full">
                    <pre><code>{stringifyWithBigInt(codeBlockValue)}</code
                      ></pre>
                  </div>
                {/if}
              {/each}
            </div>
          </li>
          <li>
            <input id="result" type="radio" name="tabs" />
            <label for="result">Result</label>
            <div id="tab-result" class="tab-panel">
              {#each getPayloadAttributes(group.lastEvent) as attribute}
                {@const isFailure = attribute.key === 'failure'}
                {@const codeBlockValue = isFailure
                  ? getFailureMessage(attribute.value)
                  : getCodeBlockValueWithoutNullPayloads(attribute.value)}
                {#if codeBlockValue}
                  <div class="h-full">
                    <pre><code>{stringifyWithBigInt(codeBlockValue)}</code
                      ></pre>
                  </div>
                {/if}
              {/each}
            </div>
          </li>
          <li>
            <input id="json" type="radio" name="tabs" />
            <label for="json">JSON</label>
            <div id="tab-json" class="tab-panel">
              <pre><code>{stringifyWithBigInt(group)}</code></pre>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .tabs {
    list-style: none;
    position: relative;
    margin: 0;
    padding: 0;
    width: 100%;
  }

  .tabs li {
    display: inline-block;
  }

  .tabs input[type='radio'] {
    display: none;
  }

  .tabs label {
    display: block;
    cursor: pointer;
    padding: 10px 15px;
  }

  .tabs .tab-panel {
    display: none;
    overflow: hidden;
    width: 100%;
    position: absolute;
    left: 0;
  }

  #tab-panel-input {
    display: block;
  }

  .tabs [id^='tab']:checked + label {
    background-color: black;
    color: #fff;
  }

  .tabs [id^='tab']:checked ~ [id^='tab-panel'] {
    display: block;
  }
</style>
