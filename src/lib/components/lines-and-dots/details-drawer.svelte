<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import InputAndResults from '$lib/components/lines-and-dots/input-and-results.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import type { WorkflowInputAndResults } from '$lib/utilities/get-started-completed-and-task-failed-events';

  import EventDetailsHeader from './event-details-header.svelte';
  import EventDetails from './event-details.svelte';

  export let activeEvent: WorkflowEvent | 'input' | 'results';
  export let activeGroup: EventGroup;
  export let workflowEvents: WorkflowInputAndResults;
  export let workflow: WorkflowExecution;
  export let compact: boolean;

  let showJSON = false;

  $: isInputOrResults = activeEvent === 'input' || activeEvent === 'results';
</script>

<div class="flex flex-col gap-0">
  <div class="flex justify-between bg-blurple p-2 text-white">
    <h3>Details</h3>
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
    {:else}
      {#key activeEvent}
        <PayloadDecoder value={activeEvent} key="payloads" let:decodedValue>
          <CodeBlock
            content={decodedValue}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
          />
        </PayloadDecoder>
      {/key}
    {/if}
  {:else if compact}
    {#each activeGroup.eventList as event}
      <EventDetailsHeader {event} />
      <EventDetails {event} />
    {/each}
  {:else}
    <EventDetails event={activeEvent} />
  {/if}
</div>
