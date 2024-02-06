<script lang="ts">
  import { fly } from 'svelte/transition';

  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import InputAndResults from '$lib/components/lines-and-dots/input-and-results.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import {
    capitalize,
    spaceBetweenCapitalLetters,
  } from '$lib/utilities/format-camel-case';
  import type { WorkflowInputAndResults } from '$lib/utilities/get-started-completed-and-task-failed-events';

  import EventDetailsHeader from './event-details-header.svelte';
  import EventDetails from './event-details.svelte';
  import PendingDetails from './pending-details.svelte';

  export let activeEvent: WorkflowEvent | 'input' | 'results';
  export let activeGroup: EventGroup;
  export let workflowEvents: WorkflowInputAndResults;
  export let workflow: WorkflowExecution;
  export let compact: boolean;

  let showJSON = false;

  $: isInputOrResults = activeEvent === 'input' || activeEvent === 'results';
</script>

<div
  class="relative h-full w-full bg-slate-950"
  in:fly={{ x: 100, delay: 0, duration: 500 }}
>
  <div class="sticky top-12 h-auto w-full">
    <div class="flex flex-col gap-0">
      <div class="flex justify-between bg-blurple p-2 text-white">
        <div class="flex items-center gap-1">
          {isInputOrResults
            ? capitalize(activeEvent)
            : activeEvent?.name
            ? `${activeEvent.id} ${spaceBetweenCapitalLetters(
                activeEvent.name,
              )}`
            : `${activeGroup.lastEvent.id} ${spaceBetweenCapitalLetters(
                activeGroup.lastEvent.name,
              )}`}
        </div>
        <div class="flex items-center gap-1">
          <Icon name="info" />
          <ToggleSwitch
            label="JSON"
            labelHidden
            disabled={isInputOrResults}
            id="pass-access-token"
            bind:checked={showJSON}
            data-testid="show-details-json"
          />
          <Icon name="json" />
        </div>
      </div>
      {#if showJSON || isInputOrResults}
        {#if activeEvent === 'input'}
          <InputAndResults
            content={workflowEvents.input}
            data-testid="workflow-input"
          />
        {:else if activeEvent === 'results'}
          <InputAndResults
            content={workflowEvents.results}
            data-testid="workflow-result"
            isRunning={workflow.isRunning}
          />
        {:else if compact}
          {#each activeGroup.eventList.reverse() as event, index}
            {#if index !== 0}<EventDetailsHeader {event} />{/if}
            <PayloadDecoder value={event} key="payloads" let:decodedValue>
              <CodeBlock
                content={decodedValue}
                copyIconTitle={translate('common.copy-icon-title')}
                copySuccessIconTitle={translate(
                  'common.copy-success-icon-title',
                )}
              />
            </PayloadDecoder>
          {/each}
        {:else}
          <PayloadDecoder value={activeEvent} key="payloads" let:decodedValue>
            <CodeBlock
              content={decodedValue}
              copyIconTitle={translate('common.copy-icon-title')}
              copySuccessIconTitle={translate('common.copy-success-icon-title')}
            />
          </PayloadDecoder>
        {/if}
      {:else if compact}
        {#each activeGroup.eventList.reverse() as event, index}
          {#if index !== 0}<EventDetailsHeader {event} />{/if}
          <EventDetails {event} />
        {/each}
      {:else if activeEvent?.activityId}
        <PendingDetails pendingActivity={activeEvent} />
      {:else}
        <EventDetails event={activeEvent} />
      {/if}
    </div>
  </div>
</div>
