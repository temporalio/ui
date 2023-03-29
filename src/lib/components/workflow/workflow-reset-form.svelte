<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { ResetType } from '$lib/models/workflow-actions';
  import { ResetReapplyType } from '$types';

  const DEFAULT_RESET_ID_HINT_TEXT =
    'Only Workflow Events of type WorkflowTaskCompleted, WorkflowTaskFailed, or WorkflowTaskTimeout are supported.';

  export let resetType: ResetType;
  export let resetReapplyType: ResetReapplyType;
  ResetReapplyType.RESET_REAPPLY_TYPE_UNSPECIFIED;
  export let eventIdValid: boolean;
  export let reason: string | undefined;
  export let lastEvent: WorkflowEvent | undefined;
  export let eventId: string | undefined = undefined;

  let resetIdHintText: string = DEFAULT_RESET_ID_HINT_TEXT;

  const resetTypes = [
    {
      value: ResetType.FirstWorkflowTask,
      label: 'First workflow task',
    },
    {
      value: ResetType.LastWorkflowTask,
      label: 'Last workflow task',
    },
    {
      value: ResetType.EventId,
      label: 'Event ID',
    },
  ];

  const resetReapplyTypes = [
    {
      value: ResetReapplyType.RESET_REAPPLY_TYPE_UNSPECIFIED,
      label: 'All Events',
    },
    {
      value: ResetReapplyType.RESET_REAPPLY_TYPE_SIGNAL,
      label: 'Signals Only',
    },
    {
      value: ResetReapplyType.RESET_REAPPLY_TYPE_NONE,
      label: 'None',
    },
  ];

  const handleResetIdInput = (event: InputEvent) => {
    const eventTarget = event.target as HTMLInputElement;
    if (eventTarget.value) {
      const parsed = parseInt(eventTarget.value);
      const lastEventId = lastEvent?.id;
      if (parsed < 1 || parsed > parseInt(lastEventId)) {
        eventIdValid = false;
        resetIdHintText = `Please enter an Event ID between 1 and ${lastEventId}`;
      } else {
        eventIdValid = true;
        resetIdHintText = DEFAULT_RESET_ID_HINT_TEXT;
      }
    }
  };
</script>

<div class="flex w-full flex-col gap-4">
  <Select
    label="Reset to"
    id="reset-type-select"
    bind:value={resetType}
    testId="workflow-reset-type-select"
  >
    {#each resetTypes as { value, label }}
      <Option {value}>
        {label}
      </Option>
    {/each}
  </Select>
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
  {#if resetType === ResetType.EventId}
    <Input
      label="Event ID"
      id="reset-event-id"
      bind:value={eventId}
      on:input={handleResetIdInput}
      hintText={resetIdHintText}
      valid={eventIdValid}
    />
  {/if}
</div>
