<script lang="ts">
  import Input from '$lib/holocene/input/input.svelte';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { ResetType } from '$lib/models/workflow-actions';

  const DEFAULT_RESET_ID_HINT_TEXT =
    'Only Workflow Events of type WorkflowTaskCompleted, WorkflowTaskFailed, or WorkflowTaskTimeout are supported.';

  export let resetType: ResetType;
  export let eventIdValid: boolean;
  export let reason: string | undefined;
  export let lastEvent: WorkflowEvent | undefined;
  export let eventId: string | undefined = undefined;

  let resetIdHintText: string = DEFAULT_RESET_ID_HINT_TEXT;

  const resetTypes = [
    {
      value: ResetType.FirstWorkflowTask,
      label: 'Reset to first workflow task',
    },
    {
      value: ResetType.LastWorkflowTask,
      label: 'Reset to last workflow task',
    },
    {
      value: ResetType.EventId,
      label: 'Reset to Event ID',
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
    id="reset-type-select"
    bind:value={resetType}
    testId="workflow-reset-type-select"
  >
    {#each resetTypes as { value, label }}
      <Option value={Number(value)}>
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
