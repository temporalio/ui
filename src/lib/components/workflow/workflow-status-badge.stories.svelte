<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';

  import type { WorkflowStatus } from '$lib/types/workflows';

  import WorkflowStatusBadge from './workflow-status-badge.svelte';

  const statuses: NonNullable<WorkflowStatus>[] = [
    'Running',
    'Paused',
    'Completed',
    'ContinuedAsNew',
    'Failed',
    'TimedOut',
    'Terminated',
    'Canceled',
  ];

  const { Story } = defineMeta({
    title: 'IO/Product/Workflow/Status Badge',
    component: WorkflowStatusBadge,
    args: {
      status: 'Running',
      delayed: false,
      taskFailure: false,
    },
    argTypes: {
      status: { control: 'select', options: statuses },
      delayed: { control: 'boolean' },
      taskFailure: { control: 'boolean' },
    },
    parameters: {
      layout: 'padded',
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof WorkflowStatusBadge>)}
  <div class="border border-primary bg-surface-primary p-6 text-primary">
    <WorkflowStatusBadge {...args} />
  </div>
{/snippet}

<Story name="Playground" />

<Story name="Modifier combinations">
  {#snippet template()}
    <div
      class="flex flex-wrap items-center gap-4 border border-primary bg-surface-primary p-6 text-primary"
    >
      <WorkflowStatusBadge status="Running" />
      <WorkflowStatusBadge status="Running" delayed />
      <WorkflowStatusBadge status="Running" taskFailure />
      <WorkflowStatusBadge status="Running" delayed taskFailure />
    </div>
  {/snippet}
</Story>
