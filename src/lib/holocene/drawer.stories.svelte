<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { action } from 'storybook/actions';
  import { fn } from 'storybook/test';
  import type { ComponentProps } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Button from './button.svelte';
  import DrawerContent from './drawer-content.svelte';
  import Drawer from './drawer.svelte';

  const { Story } = defineMeta({
    title: 'Drawer',
    component: Drawer,
    args: {
      open: true,
      position: 'bottom',
      dark: true,
      closeButtonLabel: 'Close',
      closePadding: true,
      onClick: fn(),
    },
    argTypes: {
      position: {
        name: 'Position',
        control: 'radio',
        options: ['bottom', 'right'],
      },
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
  });
</script>

<script lang="ts">
  let open = $state(true);
</script>

{#snippet template(args: ComponentProps<typeof Drawer>)}
  <Button onclick={() => (open = !open)}>Toggle Drawer</Button>
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
{/snippet}

{#snippet withSubtitle(args: ComponentProps<typeof Drawer>)}
  <Button onclick={() => (open = !open)}>Toggle Drawer</Button>
  <Drawer bind:open {...args} onClick={action('click')}>
    <DrawerContent title="Drawer Title">
      {#snippet subtitle()}
        <span>A supporting subtitle line</span>
      {/snippet}
      <p class={merge(args.position === 'right' && 'max-w-80')}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
      </p>
    </DrawerContent>
  </Drawer>
{/snippet}

{#snippet subtitleOnly(args: ComponentProps<typeof Drawer>)}
  <Button onclick={() => (open = !open)}>Toggle Drawer</Button>
  <Drawer bind:open {...args} onClick={action('click')}>
    <DrawerContent>
      {#snippet subtitle()}
        <span>Subtitle rendered without a title</span>
      {/snippet}
      <p class={merge(args.position === 'right' && 'max-w-80')}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
      </p>
    </DrawerContent>
  </Drawer>
{/snippet}

{#snippet noHeader(args: ComponentProps<typeof Drawer>)}
  <Button onclick={() => (open = !open)}>Toggle Drawer</Button>
  <Drawer bind:open {...args} onClick={action('click')}>
    <DrawerContent>
      <p class={merge(args.position === 'right' && 'max-w-80')}>
        With no title and no subtitle slot, DrawerContent omits the header
        wrapper and applies its own top padding, so the content is not flush
        against the top edge of the drawer.
      </p>
    </DrawerContent>
  </Drawer>
{/snippet}

<Story name="Bottom" {template} />

<Story name="Right" args={{ position: 'right' }} {template} />

<Story name="Bottom (Light)" args={{ dark: false }} {template} />

<Story
  name="Right (Light)"
  args={{ position: 'right', dark: false }}
  {template}
/>

<Story name="With Subtitle" template={withSubtitle} />

<Story name="Subtitle Only" template={subtitleOnly} />

<Story name="No Title or Subtitle" template={noHeader} />
