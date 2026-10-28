<script lang="ts">
  import { untrack } from 'svelte';

  import type { SearchAttributesSchema } from '$lib/stores/search-attributes';
  import type { SearchAttributes } from '$lib/types/workflows';

  import { getWorkflowDetailsDefaults } from './workflow-details-defaults';
  import type {
    ScheduledActionForm,
    ScheduledActionFormData,
    ScheduledActionSummaryItem,
    SupportedScheduledAction,
  } from '../../../types';

  import WorkflowForm from './workflow-form.svelte';

  type Props = {
    resolvedAction: SupportedScheduledAction<'workflow'>;
    customSearchAttributes: SearchAttributes;
    searchAttributes: SearchAttributesSchema;
    onSummaryChange: (summary: ScheduledActionSummaryItem[]) => void;
  };

  let {
    resolvedAction,
    customSearchAttributes,
    searchAttributes = $bindable(),
    onSummaryChange,
  }: Props = $props();

  const schedule = untrack(() => resolvedAction.schedule);
  const initialValues = untrack(() =>
    getWorkflowDetailsDefaults(schedule, customSearchAttributes),
  );

  searchAttributes = initialValues.workflowSearchAttributes;

  let workflowForm = $state<ScheduledActionForm>();

  export async function validate(): Promise<ScheduledActionFormData | null> {
    return (await workflowForm?.validate()) ?? null;
  }
</script>

<WorkflowForm
  {schedule}
  {initialValues}
  bind:this={workflowForm}
  bind:searchAttributes
  {onSummaryChange}
/>
