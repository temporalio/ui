<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import DrawerContent from './drawer-content.svelte';
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
  <Drawer closeButtonLabel="Close" {...args} onClick={handleClick}>
    <DrawerContent title="whaddup">
      <div class="w-[30vw] max-w-fit">ayy</div>
    </DrawerContent>
  </Drawer>
</Template>

<Story
  name="drawer"
  args={{ position: 'bottom', open: true, title: 'Drawer' }}
/>

<Story
  name="FancyDrawerRight"
  args={{ position: 'right', open: true, title: 'Drawer', closePadding: false }}
  template="fancyright"
/>

<Template let:args id="fancyright">
  <Drawer {...args}>
    <div class="h-full w-[30vw] bg-danger">rawr</div>
  </Drawer>
</Template>

<Story
  name="FancyDrawerBottom"
  args={{
    position: 'bottom',
    open: true,
    title: 'Drawer',
    closePadding: false,
  }}
  template="fancybottom"
/>

<Template let:args id="fancybottom">
  <Drawer {...args}>
    <div class="h-[20vh] w-full bg-danger">rawr</div>
  </Drawer>
</Template>
