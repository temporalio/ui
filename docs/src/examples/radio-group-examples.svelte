<script lang="ts">
  import { RadioGroup, RadioGroupItem } from '$lib/io-ark/radio-group';

  let conflictPolicy = $state<string | null>('fail');
  let resetPoint = $state<string | null>(null);
  let view = $state<string | null>('compact');
</script>

<div class="grid gap-8 md:grid-cols-2">
  <RadioGroup
    label="Workflow ID conflict policy"
    helperText="What happens when a running workflow already uses this ID."
    bind:value={conflictPolicy}
    items={[
      {
        value: 'fail',
        label: 'Fail',
        description: 'Reject the new workflow.',
      },
      {
        value: 'use-existing',
        label: 'Use existing',
        description: 'Return the running workflow instead.',
      },
      {
        value: 'terminate',
        label: 'Terminate existing',
        description: 'Stop the running workflow and start a new one.',
      },
    ]}
  />
  <RadioGroup
    label="Reset point"
    bind:value={resetPoint}
    required
    error={resetPoint ? '' : 'Choose where to reset the workflow.'}
  >
    <RadioGroupItem value="first" label="First workflow task" />
    <RadioGroupItem value="last" label="Last workflow task" />
    <RadioGroupItem
      value="event"
      label="Specific event"
      description="Event 42 · WorkflowTaskCompleted"
    />
    <RadioGroupItem
      value="build"
      label="Bad build ID"
      description="No bad builds are recorded for this workflow."
      disabled
    />
  </RadioGroup>
  <RadioGroup
    label="Event history view"
    orientation="horizontal"
    bind:value={view}
    items={[
      { value: 'compact', label: 'Compact' },
      { value: 'timeline', label: 'Timeline' },
      { value: 'json', label: 'JSON' },
    ]}
  />
</div>
