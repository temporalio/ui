<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Badge from './badge.svelte';
</script>

<Meta
  title="Badge"
  component={Badge}
  argTypes={{
    type: {
      control: 'select',
      options: [
        'default',
        'alpha',
        'beta',
        'warning',
        'error',
        'ative',
        'available',
        'running',
        'red',
        'green',
        'blue',
        'purple',
        'gray',
      ],
    },
  }}
/>

<Template let:args>
  <Badge {...args}>Badge</Badge>
</Template>

<Story name="badge" args={{ type: 'default' }} />

<Story argTypes={{ count: { control: 'number' } }} name="count badge" let:args>
  <Badge type="count">{args.count ?? 0}</Badge>
</Story>
