<script lang="ts" context="module">
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import type { Meta } from '@storybook/svelte';

  import WorkflowStatus from './workflow-status.svelte';

  export const meta = {
    title: 'Workflow Status',
    component: WorkflowStatus,
    args: {
      count: undefined,
      newCount: undefined,
      big: false,
      loading: false,
      delay: 0,
    },
    argTypes: {
      count: { name: 'Current Count', control: 'number' },
      newCount: { name: 'New Workflow Count', control: 'number' },
      big: { name: 'Big', control: 'boolean' },
      loading: { name: 'Loading', control: 'boolean' },
      delay: { name: 'Delay', control: 'number' },
      status: {
        table: {
          disable: true,
        },
      },
    },
  } satisfies Meta<WorkflowStatus>;

  const withCount = { count: 100 };
  const withNewCount = { ...withCount, newCount: 999 };
</script>

<Template let:args>
  <div class="space-y-4 md:columns-2 xl:columns-3">
    <WorkflowStatus {...args} status="Running" />
    <WorkflowStatus {...args} status="TimedOut" />
    <WorkflowStatus {...args} status="Completed" />
    <WorkflowStatus {...args} status="Failed" />
    <WorkflowStatus {...args} status="ContinuedAsNew" />
    <WorkflowStatus {...args} status="Canceled" />
    <WorkflowStatus {...args} status="Terminated" />
    <WorkflowStatus {...args} status="Paused" />
    <WorkflowStatus {...args} status="Scheduled" />
    <WorkflowStatus {...args} status="Started" />
    <WorkflowStatus {...args} status="Unspecified" />
    <WorkflowStatus {...args} status="Open" />
    <WorkflowStatus {...args} status="New" />
    <WorkflowStatus {...args} status="Initiated" />
    <WorkflowStatus {...args} status="Fired" />
    <WorkflowStatus {...args} status="CancelRequested" />
    <WorkflowStatus {...args} status="Signaled" />
  </div>
</Template>

<Story name="Default" />

<Story name="With Count" args={{ ...withCount }} />

<Story name="With New Workflow Count" args={{ ...withNewCount }} />

<Story name="Loading" args={{ loading: true }} />

<Story name="Loading with Counts" args={{ loading: true, ...withNewCount }} />

<Story name="Big" args={{ big: true }} />

<Story name="Big with Counts" args={{ big: true, ...withNewCount }} />

<Story
  name="Default (Dark)"
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="With Count (Dark)"
  args={{ ...withCount }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="With New Workflow Count (Dark)"
  args={{ ...withNewCount }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Loading (Dark)"
  args={{ loading: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Loading with Counts (Dark)"
  args={{ loading: true, ...withNewCount }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Big (Dark)"
  args={{ big: true }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>

<Story
  name="Big with Counts (Dark)"
  args={{ big: true, ...withNewCount }}
  parameters={{ themes: { themeOverride: 'dark' } }}
/>
