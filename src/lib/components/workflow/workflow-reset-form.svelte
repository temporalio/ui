<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { ResetReapplyType } from '$lib/models/workflow-actions';
  import { resetEvents } from '$lib/stores/events';

  export let resetReapplyType: ResetReapplyType = ResetReapplyType.Signal;
  export let reason = '';
  export let eventId: Writable<string>;

  const handleResetReapplyTypeChange = (
    event: CustomEvent<{ checked: boolean }>,
  ) => {
    resetReapplyType = event.detail.checked
      ? ResetReapplyType.Signal
      : ResetReapplyType.None;
  };
</script>

<div class="flex w-full flex-col gap-4">
  <RadioGroup
    name="reset-event-id"
    group={eventId}
    class="max-h-40 overflow-auto"
    description={translate('workflows', 'reset-event-radio-group-description')}
  >
    {#each $resetEvents as event}
      <RadioInput
        id="reset-event-{event.id}"
        value={event.id}
        label="{event.id} - {event.eventType}"
      />
    {/each}
  </RadioGroup>
  <Checkbox
    id="reset-reapply-type-checkbox"
    checked={resetReapplyType === ResetReapplyType.Signal}
    on:change={handleResetReapplyTypeChange}
    label={translate('workflows', 'reset-reapply-type-label')}
  />

  <Input id="reset-reason" bind:value={reason} label={translate('reason')} />
</div>
