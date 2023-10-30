<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Drawer from './drawer.svelte';

  const handleClick = (e) => {
    action('click')(e);
  };
</script>

<Meta
  title="Drawer"
  component={Drawer}
  argTypes={{
    position: { control: 'radio', options: ['bottom', 'right'] },
    title: { control: 'text' },
    onClick: { control: false },
    closeButtonLabel: { control: 'text' },
  }}
/>

<Template let:args>
  <Drawer closeButtonLabel="Close" {...args} onClick={handleClick} />
</Template>

<Story
  name="drawer"
  args={{ position: 'bottom', open: true, title: 'Drawer' }}
/>
