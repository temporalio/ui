<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import { iconNames } from './icon';

  import EmptyState from './empty-state.svelte';

  export const meta = {
    title: 'Empty State',
    component: EmptyState,
    args: {
      title: 'No Resources Found',
      content: 'The resources you requested could not be found.',
      error: '',
      icon: 'comet',
    },
    argTypes: {
      title: { control: 'text' },
      content: { control: 'text' },
      error: { control: 'text' },
      icon: {
        control: 'select',
        options: iconNames,
        table: {
          category: 'Icon',
        },
      },
    },
  } satisfies Meta<EmptyState>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <EmptyState {...args} />
</Template>

<Story name="Default" />

<Story
  name="Error"
  args={{
    error: 'This is an error message.',
  }}
/>
