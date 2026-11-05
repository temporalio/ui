<script lang="ts">
  import { tick } from 'svelte';
  import type { SuperForm } from 'sveltekit-superforms';

  import DurationInput, {
    getFirstWholeNumberUnit,
    SECONDS,
  } from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  import { durationUnits } from '../../../../constants';
  import {
    DEFAULT_TASK_TIMEOUT,
    MAX_TASK_TIMEOUT_SECONDS,
  } from '../../constants';
  import type { FormWorkflowDetails } from '../../schema';
  import type { WorkflowSchedule } from '../../types';

  import WorkflowInputPayload from './workflow-input-payload.svelte';

  type Props = {
    schedule: WorkflowSchedule | null;
    form: SuperForm<FormWorkflowDetails>['form'];
    errors: SuperForm<FormWorkflowDetails>['errors'];
    validateField: SuperForm<FormWorkflowDetails>['validate'];
  };

  let { form, errors, validateField, schedule }: Props = $props();

  const validateChangedField = async (
    field:
      | 'workflowType'
      | 'workflowId'
      | 'taskQueue'
      | 'taskTimeout'
      | 'runTimeout'
      | 'executionTimeout',
  ) => {
    await tick();
    if ($errors[field]) {
      await validateField(field, { update: 'errors' });
    }
  };

  let taskTimeoutResetKey = $state(0);

  const handleTaskTimeoutBlur = async (
    event: FocusEvent & { currentTarget: HTMLInputElement },
  ) => {
    if (!event.currentTarget.value) {
      $form.taskTimeout = DEFAULT_TASK_TIMEOUT;
      taskTimeoutResetKey += 1;
    }
    await validateField('taskTimeout');
  };
</script>

<Input
  id="workflowType"
  bind:value={$form.workflowType}
  onblur={() => validateField('workflowType')}
  oninput={() => validateChangedField('workflowType')}
  data-testid="schedule-type-input"
  label={translate('common.workflow-type')}
  error={!!$errors.workflowType?.[0]}
  hintText={$errors.workflowType?.[0]}
  required
/>
<Input
  id="workflowId"
  bind:value={$form.workflowId}
  onblur={() => validateField('workflowId')}
  oninput={() => validateChangedField('workflowId')}
  data-testid="schedule-workflow-id-input"
  label={translate('common.workflow-id')}
  hintText={$errors.workflowId?.[0] || translate('schedules.workflow-id-hint')}
  error={!!$errors.workflowId?.[0]}
/>
<Input
  id="taskQueue"
  bind:value={$form.taskQueue}
  onblur={() => validateField('taskQueue')}
  oninput={() => validateChangedField('taskQueue')}
  data-testid="schedule-task-queue-input"
  label={translate('common.task-queue')}
  error={!!$errors.taskQueue?.[0]}
  hintText={$errors.taskQueue?.[0] || translate('schedules.task-queue-hint')}
  required
/>
<WorkflowInputPayload
  bind:input={() => $form.input ?? '', (value) => ($form.input = value)}
  bind:editInput={$form.editInput}
  bind:encoding={$form.encoding}
  bind:messageType={
    () => $form.messageType ?? '', (value) => ($form.messageType = value)
  }
  payloads={schedule?.schedule.action.startWorkflow.input ?? undefined}
  showEditActions={schedule !== null}
/>
{#key taskTimeoutResetKey}
  <DurationInput
    id="task-timeout-duration"
    label={translate('schedules.task-timeout')}
    inputmode="numeric"
    bind:value={$form.taskTimeout}
    units={[SECONDS]}
    initialUnit="second(s)"
    error={!!$errors.taskTimeout?.[0]}
    hintText={$errors.taskTimeout?.[0] ||
      translate('schedules.task-timeout-description')}
    inputClass="max-w-80"
    min={0}
    max={MAX_TASK_TIMEOUT_SECONDS}
    step={1}
    onblur={handleTaskTimeoutBlur}
    oninput={() => validateChangedField('taskTimeout')}
  />
{/key}
<DurationInput
  id="run-timeout-duration"
  label={translate('schedules.run-timeout')}
  inputmode="numeric"
  bind:value={$form.runTimeout}
  initialUnit={getFirstWholeNumberUnit(
    $form.runTimeout,
    durationUnits,
    'second(s)',
  )}
  units={durationUnits}
  error={!!$errors.runTimeout?.[0]}
  hintText={$errors.runTimeout?.[0] ||
    translate('schedules.run-timeout-description')}
  inputClass="max-w-80"
  min={0}
  onblur={() => validateField('runTimeout')}
  oninput={() => validateChangedField('runTimeout')}
/>
<DurationInput
  id="execution-timeout-duration"
  label={translate('schedules.execution-timeout')}
  inputmode="numeric"
  bind:value={$form.executionTimeout}
  initialUnit={getFirstWholeNumberUnit(
    $form.executionTimeout,
    durationUnits,
    'second(s)',
  )}
  units={durationUnits}
  error={!!$errors.executionTimeout?.[0]}
  hintText={$errors.executionTimeout?.[0] ||
    translate('schedules.execution-timeout-description')}
  inputClass="max-w-80"
  min={0}
  onblur={() => validateField('executionTimeout')}
  oninput={() => validateChangedField('executionTimeout')}
/>
