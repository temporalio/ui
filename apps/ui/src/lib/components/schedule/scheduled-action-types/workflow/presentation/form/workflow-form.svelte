<script lang="ts">
  import { untrack } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';

  import Alert from '$lib/holocene/alert.svelte';
  import { formatList } from '$lib/i18n/format-list';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributesSchema } from '$lib/stores/search-attributes';

  import type {
    ScheduledActionFormData,
    ScheduledActionSummaryItem,
  } from '../../../types';
  import {
    type FormWorkflowDetails,
    formWorkflowDetailsSchema,
  } from '../../schema';
  import type { WorkflowSchedule } from '../../types';

  import WorkflowDetailsForm from './workflow-details-form.svelte';

  type Props = {
    schedule: WorkflowSchedule | null;
    initialValues: FormWorkflowDetails;
    searchAttributes: SearchAttributesSchema;
    onSummaryChange: (summary: ScheduledActionSummaryItem[]) => void;
  };

  let {
    schedule,
    initialValues,
    searchAttributes = $bindable(),
    onSummaryChange,
  }: Props = $props();

  const superform = superForm(
    untrack(() => initialValues),
    {
      SPA: true,
      dataType: 'json',
      validators: zodClient(formWorkflowDetailsSchema),
      validationMethod: 'onsubmit',
      resetForm: false,
      applyAction: false,
      invalidateAll: false,
    },
  );

  const {
    form,
    errors,
    allErrors,
    validate: validateField,
    validateForm,
  } = superform;

  $effect(() => {
    $form.workflowSearchAttributes = $state.snapshot(searchAttributes);
  });

  $effect(() => {
    onSummaryChange([
      {
        label: translate('schedules.summary-workflow-type-label'),
        value: $form.workflowType,
      },
      {
        label: translate('common.task-queue'),
        value: $form.taskQueue,
      },
    ]);
  });

  export async function validate(): Promise<ScheduledActionFormData | null> {
    const result = await validateForm({ update: true });

    if (!result.valid) {
      return null;
    }

    return { type: 'workflow', details: result.data };
  }
</script>

<WorkflowDetailsForm {form} {errors} {validateField} {schedule} />

<Alert
  intent="error"
  title={translate('schedules.fix-workflow-form-errors')}
  hidden={!$allErrors.length}
>
  <ul class="list-inside list-disc">
    {#each $allErrors as { path, messages } (path)}
      <li>{formatList(messages)}</li>
    {/each}
  </ul>
</Alert>
