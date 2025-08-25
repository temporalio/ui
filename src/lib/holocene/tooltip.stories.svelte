<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Button from '$lib/anthropocene/button.svelte';
  import { iconNames } from '$lib/holocene/icon';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  export const meta = {
    title: 'Tooltip',
    component: Tooltip,
    args: {
      text: 'This is a tooltip',
      show: true,
      hide: false,
    },
    argTypes: {
      text: { name: 'Content', control: 'text' },
      hide: {
        name: 'Hide',
        control: 'boolean',
        if: { arg: 'show', neq: true },
      },
      show: {
        name: 'Show',
        control: 'boolean',
        if: { arg: 'hide', neq: true },
      },
      icon: { name: 'Icon', control: 'select', options: iconNames },
      width: { name: 'Width', control: { type: 'range', min: 0, max: 400 } },
      top: {
        name: 'Top',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      left: {
        name: 'Left',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      right: {
        name: 'Right',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      bottom: {
        name: 'Bottom',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      topRight: {
        name: 'Top Right',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      topLeft: {
        name: 'Top Left',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      bottomRight: {
        name: 'Bottom Right',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
      bottomLeft: {
        name: 'Bottom Left',
        control: 'boolean',
        table: { category: 'Positioning' },
      },
    },
  } satisfies Meta<Omit<Tooltip, 'copyIconTitle'>>;
</script>

<script lang="ts">
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args let:context>
  <div class="flex h-screen w-full items-center justify-center">
    <Tooltip {...args}>
      <Button>{context.name} Tooltip</Button>
    </Tooltip>
  </div>
</Template>

<Story name="Top" args={{ top: true }} />

<Story name="Top with Icon" args={{ top: true, icon: 'trash' }} />

<Story name="Top Right" args={{ topRight: true }} />

<Story name="Top Right with Icon" args={{ topRight: true, icon: 'trash' }} />

<Story name="Top Left" args={{ topLeft: true }} />

<Story name="Top Left with Icon" args={{ topLeft: true, icon: 'trash' }} />

<Story name="Bottom" args={{ bottom: true }} />

<Story name="Bottom with Icon" args={{ bottom: true, icon: 'trash' }} />

<Story name="Bottom Right" args={{ bottomRight: true }} />

<Story
  name="Bottom Right with Icon"
  args={{ bottomRight: true, icon: 'trash' }}
/>

<Story name="Bottom Left" args={{ bottomLeft: true }} />

<Story
  name="Bottom Left with Icon"
  args={{ bottomLeft: true, icon: 'trash' }}
/>

<Story name="Left" args={{ left: true }} />

<Story name="Left with Icon" args={{ left: true, icon: 'trash' }} />

<Story name="Right" args={{ right: true }} />

<Story name="Right with Icon" args={{ right: true, icon: 'trash' }} />

<Story name="With Content instead of text">
  <Tooltip bottomRight show>
    <div slot="content">
      <div>whadup</div>
      <div>whadup</div>
      <div>whadup</div>
    </div>
    <Button>Tooltip</Button>
  </Tooltip>
</Story>
