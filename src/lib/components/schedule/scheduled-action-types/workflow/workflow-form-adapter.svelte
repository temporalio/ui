<script lang="ts">
  import { untrack } from 'svelte';

  import type {
    ScheduledActionForm,
    ScheduledActionFormAdapterProps,
    ScheduledActionFormData,
  } from '../types';
  import { getWorkflowDetailsDefaults } from './workflow-details-defaults';

  import WorkflowForm from './form.svelte';

  let {
    resolvedAction,
    customSearchAttributes,
    searchAttributes = $bindable(),
    onSummaryChange,
  }: ScheduledActionFormAdapterProps<'workflow'> = $props();

  const mode = untrack(() => resolvedAction);
  const initialValues = untrack(() =>
    getWorkflowDetailsDefaults(mode, customSearchAttributes),
  );

  searchAttributes = initialValues.workflowSearchAttributes;

  let workflowForm = $state<ScheduledActionForm>();

  export async function validate(): Promise<ScheduledActionFormData | null> {
    return (await workflowForm?.validate()) ?? null;
  }
</script>

<WorkflowForm
  {...mode}
  {initialValues}
  bind:this={workflowForm}
  bind:searchAttributes
  {onSummaryChange}
/>
