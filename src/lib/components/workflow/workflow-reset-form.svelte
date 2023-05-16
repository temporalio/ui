<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { ResetReapplyType } from '$lib/models/workflow-actions';
  import { resetEvents } from '$lib/stores/events';

  export let resetReapplyType: ResetReapplyType = ResetReapplyType.Unspecified;
  export let reason: string = '';
  export let eventId: string = '';

  $: {
    if ($resetEvents && $resetEvents.length > 0) {
      eventId = $resetEvents[0].eventId;
    }
  }

  const resetReapplyTypes = [
    {
      value: ResetReapplyType.Unspecified,
      label: 'All Events',
    },
    {
      value: ResetReapplyType.Signal,
      label: 'Signals Only',
    },
    {
      value: ResetReapplyType.None,
      label: 'None',
    },
  ];
</script>

<div class="flex w-full flex-col gap-4">
  <ul class="w-full rounded border border-primary max-h-40 overflow-y-scroll">
    {#each $resetEvents as event}
      <li
        class="w-full h-10 border-b border-primary last-of-type:border-none hover:bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed first-of-type:rounded-t last-of-type:rounded-b"
      >
        <label
          class="flex flex-row items-center gap-2 cursor-pointer px-4 py-2 h-full w-full"
        >
          <input
            on:click={() => (eventId = event.eventId)}
            type="radio"
            checked={event.id === eventId}
            name="reset-event-id"
            id="reset-event-{event.id}"
          />
          <p class="grid grid-cols-8">
            <span class="text-gray-500 font-medium col-span-1">
              {event.eventId}
            </span>
            <span class="font-semibold">
              {event.eventType}
            </span>
          </p>
        </label>
      </li>
    {/each}
  </ul>
  <Select
    label="Reapply Type"
    id="reset-reapply-type-select"
    bind:value={resetReapplyType}
    testId="workflow-reset-reapply-type-select"
  >
    {#each resetReapplyTypes as { value, label }}
      <Option {value}>
        {label}
      </Option>
    {/each}
  </Select>
  <Input id="reset-reason" bind:value={reason} label="Reason" />
</div>
