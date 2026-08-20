<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';

  import * as ioIcons from '$lib/io/icon';

  import EmptyState from './empty-state.svelte';

  const iconOptions: Record<string, unknown> = { ...ioIcons };

  const { Story } = defineMeta({
    title: 'Empty State',
    component: EmptyState,
    args: {
      title: 'No Resources Found',
      content: 'The resources you requested could not be found.',
      error: '',
      Icon: ioIcons.IconComet,
    },
    argTypes: {
      title: { control: 'text' },
      content: { control: 'text' },
      error: { control: 'text' },
      Icon: {
        control: 'select',
        options: Object.keys(iconOptions),
        mapping: iconOptions,
        table: {
          category: 'Icon',
        },
      },
    },
  });
</script>

<Story name="Default" />

<Story
  name="Error"
  args={{
    error: 'This is an error message.',
  }}
/>
