<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Drawer from './drawer.svelte';

  export const meta = {
    title: 'Drawer',
    component: Drawer,
    args: {
      open: true,
      position: 'bottom',
      title: 'Drawer',
      dark: true,
      closeButtonLabel: 'Close',
      closePadding: true,
    },
    argTypes: {
      position: {
        name: 'Position',
        control: 'radio',
        options: ['bottom', 'right'],
      },
      title: { name: 'Title', control: 'text' },
      dark: { name: 'Dark', control: 'boolean' },
      onClick: { control: false, table: { disable: true } },
      closePadding: { control: 'boolean', table: { disable: true } },
      closeButtonLabel: {
        name: 'Close Button Label',
        control: 'text',
        table: {
          category: 'Accessibility',
        },
      },

      open: { table: { disable: true } },
    },
  } satisfies Meta<Drawer['$$prop_def'] & { title: string }>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
  import { twMerge as merge } from 'tailwind-merge';

  import Button from './button.svelte';
  import DrawerContent from './drawer-content.svelte';

  let open = true;
</script>

<Template let:args>
  <Button on:click={() => (open = !open)}>Toggle Drawer</Button>
  <Drawer bind:open {...args} onClick={action('click')}>
    <DrawerContent title="Drawer Title">
      <p class={merge(args.position === 'right' && 'max-w-80')}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
        Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies
        sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius
        a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy
        molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.
        Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium
        a, enim. Pellentesque congue. Ut in risus volutpat libero pharetra
        tempor. Cras vestibulum bibendum augue. Praesent egestas leo in pede.
        Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit
        sodales. Vestibulum ante ipsum primis in faucibus orci luctus et
        ultrices posuere cubilia Curae; Aliquam nibh. Mauris ac mauris sed pede
        pellentesque fermentum. Maecenas adipiscing ante non diam sodales
        hendrerit.
      </p>
    </DrawerContent>
  </Drawer>
</Template>

<Story name="Bottom" />

<Story name="Right" args={{ position: 'right' }} />

<Story name="Bottom (Light)" args={{ dark: false }} />

<Story name="Right (Light)" args={{ position: 'right', dark: false }} />
