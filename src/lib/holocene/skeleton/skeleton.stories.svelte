<script lang="ts">
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Skeleton from './index.svelte';
</script>

<Meta
  title="Skeleton Loader"
  component={Skeleton}
  args={{ class: 'h-4' }}
  argTypes={{
    class: {
      control: 'text',
      description: 'Tailwind compliant "heigh" class, i.e. h-10',
    },
  }}
/>

<Template let:args>
  <Skeleton {...args} />
</Template>

<Story name="skeleton" />
