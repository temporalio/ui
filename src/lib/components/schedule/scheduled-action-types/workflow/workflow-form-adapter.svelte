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
  }: ScheduledActionFormAdapterProps = $props();

  const mode = untrack(() =>
    resolvedAction.type === 'workflow' ? resolvedAction : null,
  );
  const initialValues = mode
    ? untrack(() => getWorkflowDetailsDefaults(mode, customSearchAttributes))
    : null;

  if (initialValues) {
    searchAttributes = initialValues.workflowSearchAttributes;
  }

  let workflowForm = $state<ScheduledActionForm>();

  export async function validate(): Promise<ScheduledActionFormData | null> {
    return (await workflowForm?.validate()) ?? null;
  }
</script>

{#if mode && initialValues}
  <WorkflowForm
    {...mode}
    {initialValues}
    bind:this={workflowForm}
    bind:searchAttributes
    {onSummaryChange}
  />
{/if}
