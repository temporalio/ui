<script lang="ts">
  import { fly } from 'svelte/transition';

  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import EventDetailsHeader from './event-details-header.svelte';
  import EventDetails from './event-details.svelte';
  import PendingDetails from './pending-details.svelte';

  export let activeEvent: WorkflowEvent | PendingActivity | undefined =
    undefined;
  export let activeGroup: EventGroup | undefined = undefined;
  export let clearActive: () => void;

  $: timeline = activeGroup && !activeEvent;

  let showJSON = false;
</script>

<div
  class="flex h-full flex-col gap-0 overflow-auto border-l-4 bg-slate-950"
  in:fly={{ x: 50, delay: 0, duration: 350 }}
>
  <div
    class="flex flex-col justify-between bg-blurple p-2 text-white md:flex-row"
  >
    <div class="flex items-center gap-1">
      {#if timeline}
        {activeGroup.lastEvent.id}
        {spaceBetweenCapitalLetters(activeGroup.lastEvent.name)}
      {:else if isPendingActivity(activeEvent)}
        Pending
      {:else}
        {activeEvent.id} {spaceBetweenCapitalLetters(activeEvent.name)}
      {/if}
      <button
        class="cursor-pointer"
        on:click={clearActive}
        on:keypress={clearActive}
      >
        <Icon name="chevron-right" />
      </button>
    </div>
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
  </div>
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
    {#each activeGroup.eventList.reverse() as event, index}
      {#if index !== 0}<EventDetailsHeader
          text={`${event.id} ${event.name}`}
        />{/if}
      <EventDetails {event} />
    {/each}
    {#if activeGroup?.pendingActivity}
      <EventDetailsHeader text="Pending" />
      <PendingDetails pendingActivity={activeGroup.pendingActivity} />
    {/if}
  {:else if isPendingActivity(activeEvent)}
    <PendingDetails pendingActivity={activeEvent} />
  {:else}
    <EventDetails event={activeEvent} />
  {/if}
</div>
