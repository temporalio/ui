<script lang="ts">
  import { tick } from 'svelte';
  import type { SuperForm } from 'sveltekit-superforms';

  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { StartWorkflowRequest } from '$lib/types/schedule';

  import type { ActionFormMode } from '../types';
  import type { FormWorkflowDetails } from './schema';

  import WorkflowInputPayload from './workflow-input-payload.svelte';

  type Props = ActionFormMode<StartWorkflowRequest> & {
    form: SuperForm<FormWorkflowDetails>['form'];
    errors: SuperForm<FormWorkflowDetails>['errors'];
    validateField: SuperForm<FormWorkflowDetails>['validate'];
  };

  let { form, errors, validateField, ...mode }: Props = $props();
  const validateChangedField = async (
    field: 'workflowType' | 'workflowId' | 'taskQueue',
  ) => {
    await tick();
    if ($errors[field]) {
      await validateField(field, { update: 'errors' });
    }
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
  payloads={mode.isEditing
    ? (mode.existingAction.input ?? undefined)
    : undefined}
  showEditActions={mode.isEditing}
/>
