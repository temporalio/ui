<script lang="ts">
  import { Field, FieldInput, FieldTextarea } from '$lib/io-poc/field';

  let workflowId = $state('order-processing-1042');
  let taskQueue = $state('');
  let reason = $state('');
</script>

<div class="grid gap-6 sm:grid-cols-2">
  <Field
    label="Workflow ID"
    helperText="Must be unique within the namespace."
    required
  >
    <FieldInput bind:value={workflowId} />
  </Field>
  <Field
    label="Task queue"
    error={taskQueue ? '' : 'Enter a task queue name.'}
    required
  >
    <FieldInput bind:value={taskQueue} placeholder="orders-queue" />
  </Field>
  <Field label="Run ID" readOnly>
    <FieldInput value="5f2c9b1e-41a7-4d3b-9c2e-8a1f7d6e0b34" />
  </Field>
  <Field label="Namespace" disabled helperText="Set by the current context.">
    <FieldInput value="payments-prod" />
  </Field>
  <Field
    label="Termination reason"
    helperText="Recorded in the workflow history."
    class="sm:col-span-2"
  >
    <FieldTextarea
      bind:value={reason}
      placeholder="Describe why you are terminating this workflow"
    />
  </Field>
</div>
