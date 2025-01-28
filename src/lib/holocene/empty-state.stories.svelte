<script lang="ts" module>
  import {
    type Args,
    defineMeta,
    setTemplate,
  } from '@storybook/addon-svelte-csf';

  import { iconNames } from './icon';

  import EmptyState from './empty-state.svelte';

  const { Story } = defineMeta({
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
  });
</script>

<script lang="ts">
  setTemplate(template);
</script>

{#snippet template({ title, icon, ...args }: Args<typeof Story>)}
  <EmptyState {title} {icon} {...args} />
{/snippet}

<Story name="Default" />

<Story
  name="Error"
  args={{
    error: 'This is an error message.',
  }}
/>
