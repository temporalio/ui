<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import iconNames from './icon';

  import Accordion from './accordion.svelte';

  export const meta = {
    title: 'Accordion',
    component: Accordion,
    args: {
      title: 'Accordion Title',
      subtitle: 'Subtitle',
      disabled: false,
      open: false,
      readOnly: false,
    },
    argTypes: {
      title: { control: 'text' },
      subtitle: { control: 'text' },
      open: { control: 'boolean' },
      disabled: { control: 'boolean' },
      readOnly: { control: 'boolean' },
      error: { control: 'text' },
      onToggle: { action: 'onToggle', table: { disable: true } },
      id: {
        control: { type: 'text' },
        defaultValue: 'accordion',
        table: { disable: true },
      },
      class: { table: { disable: true } },
      icon: {
        control: { type: 'select', options: iconNames },
      },
    },
  } satisfies Meta;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';
</script>

<Template let:args>
  <Accordion {...args} onToggle={action('onToggle')}>
    <p>Accordion Content</p>
  </Accordion>
</Template>

<Story name="Default" />

<Story name="Open" args={{ open: true }} />

<Story name="Disabled" args={{ disabled: true }} />

<Story name="With Error" args={{ error: 'Error' }} />

<Story name="With Icon" args={{ icon: 'workflow' }} />

<Story
  name="Accordion (Dark)"
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Open (Dark)"
  args={{
    open: true,
  }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Disabled (Dark)"
  args={{ disabled: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Error (Dark)"
  args={{ error: 'Error' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="With Icon (Dark)"
  args={{ icon: 'workflow' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>
