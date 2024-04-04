<script lang="ts">
  import { Meta, Story } from '@storybook/addon-svelte-csf';

  import iconNames from './icon/icon-names';

  import EmptyState from './empty-state.svelte';
</script>

<Meta
  title="Empty State"
  component={EmptyState}
  argTypes={{
    title: { control: 'text' },
    icon: { control: 'select', options: iconNames },
  }}
/>

<Story
  name="empty state"
  args={{
    title: 'No Resources Found',
    content: 'The resources you requested could not be found',
    error: '',
  }}
  let:args
>
  <EmptyState {...args} />
</Story>
