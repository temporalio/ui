<script lang="ts" context="module">
  import type { Meta } from '@storybook/svelte';

  import Accordion from './accordion.svelte';

  import { iconNames } from '$holocene/icon';

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

<Story name="Accordion (Default)" />

<Story name="Open Accordion" args={{ open: true }} />

<Story name="Disabled Accordion" args={{ disabled: true }} />

<Story name="Accordion with Error" args={{ error: 'Error' }} />

<Story name="Accordion with Icon" args={{ icon: 'workflow' }} />

<Story name="Accordion (Default)" />

<Story
  name="Open Accordion, Dark"
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
  name="Disabled Accordion, Dark"
  args={{ disabled: true }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Accordion with Error, Dark"
  args={{ error: 'Error' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>

<Story
  name="Accordion with Icon, Dark"
  args={{ icon: 'workflow' }}
  parameters={{
    themes: {
      themeOverride: 'dark',
    },
  }}
/>
