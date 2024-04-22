<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  const badgeTypes = [
    'alpha',
    'beta',
    'warning',
    'error',
    'default',
    'count',
    'active',
    'available',
    'running',
    'red',
    'yellow',
    'green',
    'blue',
    'purple',
    'gray',
  ];

  export const meta = {
    title: 'Badge',
    component: Badge,
    args: {
      type: 'default',
      label: 'Badge',
      count: 0,
    },
    argTypes: {
      type: {
        control: 'select',
        options: badgeTypes,
      },
      label: { control: 'text', if: { arg: 'type', neq: 'count' } },
      count: { control: 'number', if: { arg: 'type', eq: 'count' } },
      class: { table: { disable: true } },
    },
  } satisfies Meta;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';

  import Badge from './badge.svelte';
</script>

<Template let:args>
  <Badge {...args}>{args.type === 'count' ? args.count : args.label}</Badge>
</Template>

<Story name="Default" args={{ type: 'default' }} />
<Story name="Alpha" args={{ type: 'alpha' }} />
<Story name="Beta" args={{ type: 'beta' }} />
<Story name="Warning" args={{ type: 'warning' }} />
<Story name="Error" args={{ type: 'error' }} />
<Story name="Active" args={{ type: 'active' }} />
<Story name="Available" args={{ type: 'available' }} />
<Story name="Running" args={{ type: 'running' }} />
<Story name="Red" args={{ type: 'red' }} />
<Story name="Yellow" args={{ type: 'yellow' }} />
<Story name="Green" args={{ type: 'green' }} />
<Story name="Blue" args={{ type: 'blue' }} />
<Story name="Purple" args={{ type: 'purple' }} />
<Story name="Gray" args={{ type: 'gray' }} />
<Story name="Count" args={{ type: 'count' }} />

<Story
  name="Default (Dark)"
  args={{ type: 'default' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Alpha (Dark)"
  args={{ type: 'alpha' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Beta (Dark)"
  args={{ type: 'beta' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Warning (Dark)"
  args={{ type: 'warning' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Error (Dark)"
  args={{ type: 'error' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Active (Dark)"
  args={{ type: 'active' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Available (Dark)"
  args={{ type: 'available' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Running (Dark)"
  args={{ type: 'running' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Red (Dark)"
  args={{ type: 'red' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Yellow (Dark)"
  args={{ type: 'yellow' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Green (Dark)"
  args={{ type: 'green' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Blue (Dark)"
  args={{ type: 'blue' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Purple (Dark)"
  args={{ type: 'purple' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Gray (Dark)"
  args={{ type: 'gray' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Count (Dark)"
  args={{ type: 'count' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>
