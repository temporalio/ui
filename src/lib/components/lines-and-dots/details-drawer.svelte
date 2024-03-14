<script lang="ts">
  import { fly } from 'svelte/transition';

  import { page } from '$app/stores';

  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import { eventFilterSort } from '$lib/stores/event-view';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import EventDetailsHeader from './event-details-header.svelte';
  import EventDetails from './event-details.svelte';
  import PendingDetails from './pending-details.svelte';
  import TimelineGraph from './svg/timeline-graph.svelte';

  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let activeGroup: EventGroup | undefined = undefined;
  export let clearActive: () => void;

  $: timeline = activeGroup && !activeEvent;
  $: ({ namespace } = $page.params);

  let showJSON = false;

  let fetchChildWorkflow;
  let fetchChildTimeline;

  const fetchChildWorkflowForGroup = (group: EventGroup) => {
    if (group && group.category === 'child-workflow') {
      const completedEvent = group.eventList.find(
        isChildWorkflowExecutionStartedEvent,
      );
      if (completedEvent) {
        const childWorkflowId =
          completedEvent.attributes.workflowExecution.workflowId;
        const childRunId = completedEvent.attributes.workflowExecution.runId;
        fetchChildWorkflow = fetchWorkflow({
          namespace,
          workflowId: childWorkflowId,
          runId: childRunId,
        });
        fetchChildTimeline = fetchAllEvents({
          namespace,
          workflowId: childWorkflowId,
          runId: childRunId,
          sort: $eventFilterSort,
        });
      }
    } else {
      fetchChildWorkflow = undefined;
      fetchChildTimeline = undefined;
    }
  };

  $: fetchChildWorkflowForGroup(activeGroup);
</script>

<div
  class="flex h-full flex-col gap-0 overflow-auto border-l-2 bg-slate-950"
  in:fly={{ x: 50, delay: 0, duration: 350 }}
>
  <div class="surface-secondary flex flex-col justify-between p-2 md:flex-row">
    <div class="flex items-center justify-end gap-4">
      <div class="flex items-center gap-0">
        <Icon name="info" />
        <ToggleSwitch
          label="JSON"
          labelHidden
          id="pass-access-token"
          bind:checked={showJSON}
          data-testid="show-details-json"
        />
        <Icon name="json" />
      </div>
    </div>
    <Button
      variant="ghost"
      on:click={clearActive}
      on:keypress={clearActive}
      trailingIcon="chevron-right"
    >
      Close
    </Button>
  </div>
  {#await Promise.all( [fetchChildWorkflow, fetchChildTimeline], ) then [childWorkflow, childHistory]}
    {@const groups = groupEvents(
      childHistory,
      $eventFilterSort,
      childWorkflow?.pendingActivities,
    )}
    <div class="mb-4 flex flex-col gap-4 bg-primary">
      <TimelineGraph
        workflow={childWorkflow.workflow}
        history={childHistory}
        {groups}
      />
    </div>
  {/await}

  {#if showJSON}
    {#if timeline}
      {#each activeGroup.eventList.reverse() as event, index}
        {#if index !== 0}<EventDetailsHeader text={event.name} />{/if}
        <PayloadDecoder value={event} key="payloads" let:decodedValue>
          <CodeBlock
            content={decodedValue}
            copyIconTitle={translate('common.copy-icon-title')}
            copySuccessIconTitle={translate('common.copy-success-icon-title')}
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
  {:else if timeline}
    {#if activeGroup?.pendingActivity}
      <EventDetailsHeader text="Pending" />
      <PendingDetails pendingActivity={activeGroup.pendingActivity} />
    {/if}
    {#each activeGroup.eventList.reverse() as event}
      <EventDetailsHeader text={`${event.id} ${event.name}`} />
      <EventDetails {event} />
    {/each}
  {:else if isPendingActivity(activeEvent)}
    <PendingDetails pendingActivity={activeEvent} />
  {:else}
    <EventDetailsHeader text={`${activeEvent.id} ${activeEvent.name}`} />
    <EventDetails event={activeEvent} />
  {/if}
</div>
