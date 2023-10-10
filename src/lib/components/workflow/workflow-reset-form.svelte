<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Input from '$lib/holocene/input/input.svelte';
  import RadioGroup from '$lib/holocene/radio-input/radio-group.svelte';
  import RadioInput from '$lib/holocene/radio-input/radio-input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { ResetReapplyType } from '$lib/models/workflow-actions';
  import { resetEvents } from '$lib/stores/events';

  export let resetReapplyType: ResetReapplyType = ResetReapplyType.Unspecified;
  export let reason = '';
  export let eventId: Writable<string>;

  const resetReapplyTypes = [
    {
      value: ResetReapplyType.Unspecified,
      label: translate('workflows', 'reset-reapply-all'),
    },
    {
      value: ResetReapplyType.Signal,
      label: translate('workflows', 'reset-reapply-signals-only'),
    },
    {
      value: ResetReapplyType.None,
      label: translate('workflows', 'reset-reapply-none'),
    },
  ];
</script>

<div class="flex w-full flex-col gap-4">
  <RadioGroup
    name="reset-event-id"
    group={eventId}
    class="max-h-40 overflow-auto"
  >
    {#each $resetEvents as event}
      <RadioInput
        id="reset-event-{event.id}"
        value={event.id}
        label="{event.id} - {event.eventType}"
      />
    {/each}
  </RadioGroup>
  <Select
    label={translate('workflows', 'reset-reapply-type-label')}
    id="reset-reapply-type-select"
    bind:value={resetReapplyType}
    data-testid="workflow-reset-reapply-type-select"
  >
    {#each resetReapplyTypes as { value, label }}
      <Option {value}>
        {label}
      </Option>
    {/each}
  </Select>
  <Input id="reset-reason" bind:value={reason} label={translate('reason')} />
</div>
