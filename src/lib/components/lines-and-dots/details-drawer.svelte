<script lang="ts">
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import InputAndResults from '$lib/components/lines-and-dots/input-and-results.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import type { WorkflowInputAndResults } from '$lib/utilities/get-started-completed-and-task-failed-events';

  import EventDetailsRowExpanded from '../event/event-details-row-expanded.svelte';

  export let activeEvent: WorkflowEvent | 'input' | 'results';
  export let workflowEvents: WorkflowInputAndResults;
  export let workflow: WorkflowExecution;

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
  {:else}
    {@const attributes = formatAttributes(activeEvent)}
    {@const eventDetails = Object.entries(attributes)}
    <div class="flex flex-col gap-2">
      {#each eventDetails as [key, value] (key)}
        <EventDetailsRowExpanded
          {key}
          {value}
          {attributes}
          class="w-full text-white"
        />
      {/each}
    </div>
  {/if}
</div>
